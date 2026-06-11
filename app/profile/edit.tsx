import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Camera, ImagePlus, TriangleAlert } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/contexts/auth';
import { useProfile, useUpdateProfile } from '@/features/profile/queries';
import {
  deleteAvatarImage,
  isLocalUri,
  isSupabaseStorageUrl,
  uploadAvatarImage,
} from '@/features/storage/upload';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getTheme } from '@/lib/theme';
import { initials } from '@/lib/utils';

export default function EditProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = getTheme(colorScheme);
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const [name, setName] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!profile || initialized.current) return;
    setName(profile.full_name ?? '');
    setAvatarUri(profile.avatar_url ?? null);
    initialized.current = true;
  }, [profile]);

  async function pickFromGallery() {
    setShowImageOptions(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) setAvatarUri(result.assets[0].uri);
  }

  async function pickFromCamera() {
    setShowImageOptions(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) setAvatarUri(result.assets[0].uri);
  }

  async function handleSave() {
    if (!user || !name.trim()) return;
    setError(null);
    setIsSaving(true);
    try {
      let finalAvatarUrl = avatarUri;
      const oldUrl = profile?.avatar_url ?? null;

      if (avatarUri && isLocalUri(avatarUri)) {
        finalAvatarUrl = await uploadAvatarImage(avatarUri, user.id);
        if (oldUrl && isSupabaseStorageUrl(oldUrl)) {
          deleteAvatarImage(oldUrl).catch(() => {});
        }
      } else if (avatarUri === null && oldUrl && isSupabaseStorageUrl(oldUrl)) {
        deleteAvatarImage(oldUrl).catch(() => {});
      }

      updateProfile(
        { full_name: name.trim(), avatar_url: finalAvatarUrl },
        {
          onSuccess: () => router.back(),
          onError: () => setError('Não foi possível salvar o perfil. Tente novamente.'),
          onSettled: () => setIsSaving(false),
        },
      );
    } catch {
      setIsSaving(false);
      setError('Não foi possível enviar a imagem. Tente novamente.');
    }
  }

  const loading = isSaving || isPending;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 24, paddingBottom: 40 + insets.bottom }}
      >
        {/* Avatar */}
        <View className="items-center gap-2 pt-4">
          <Pressable
            onPress={() => setShowImageOptions(true)}
            accessibilityLabel="Alterar foto de perfil"
            className="relative"
          >
            <Avatar alt="Foto do perfil" className="h-24 w-24">
              {avatarUri ? <AvatarImage source={{ uri: avatarUri }} /> : null}
              <AvatarFallback>
                <Text className="text-3xl font-semibold">
                  {initials(name || (profile?.full_name ?? ''))}
                </Text>
              </AvatarFallback>
            </Avatar>
            <View
              className="absolute bottom-0 right-0 h-7 w-7 items-center justify-center rounded-full"
              style={{ backgroundColor: theme.primary }}
            >
              <Camera size={14} color={theme.primaryForeground} />
            </View>
          </Pressable>
          <Text className="text-xs text-muted-foreground">Toque para alterar a foto</Text>
        </View>

        {/* Nome */}
        <View className="gap-2">
          <Text className="px-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Nome
          </Text>
          <View className="rounded-xl border border-border bg-card px-4 py-3">
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Seu nome"
              placeholderTextColor={theme.mutedForeground}
              style={{ color: theme.foreground, fontSize: 16 }}
              autoCapitalize="words"
              returnKeyType="done"
            />
          </View>
        </View>

        {/* Erro */}
        {error ? (
          <View className="flex-row items-center gap-3 rounded-xl bg-destructive/10 px-4 py-3">
            <TriangleAlert size={16} color={theme.destructive} />
            <Text className="flex-1 text-sm text-destructive">{error}</Text>
          </View>
        ) : null}

        {/* Salvar */}
        <Button
          className="w-full"
          accessibilityLabel="Salvar perfil"
          onPress={handleSave}
          disabled={!name.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={theme.primaryForeground} />
          ) : (
            <Text className="font-semibold">Salvar</Text>
          )}
        </Button>

        {/* Modal seleção de avatar */}
        <Modal
          visible={showImageOptions}
          transparent
          animationType="slide"
          onRequestClose={() => setShowImageOptions(false)}
        >
          <Pressable className="flex-1 bg-black/50" onPress={() => setShowImageOptions(false)}>
            <View className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-card pb-8">
              <View className="items-center py-3">
                <View className="h-1 w-10 rounded-full bg-muted-foreground/30" />
              </View>
              <Text className="px-4 pb-3 text-base font-semibold">Foto de perfil</Text>
              <TouchableOpacity
                onPress={pickFromCamera}
                className="flex-row items-center gap-3 px-4 py-4"
                accessibilityLabel="Tirar foto com câmera"
              >
                <Camera size={20} color={theme.foreground} />
                <Text>Câmera</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={pickFromGallery}
                className="flex-row items-center gap-3 px-4 py-4"
                accessibilityLabel="Escolher da galeria"
              >
                <ImagePlus size={20} color={theme.foreground} />
                <Text>Galeria</Text>
              </TouchableOpacity>
              {avatarUri ? (
                <TouchableOpacity
                  onPress={() => {
                    setAvatarUri(null);
                    setShowImageOptions(false);
                  }}
                  className="flex-row items-center gap-3 px-4 py-4"
                  accessibilityLabel="Remover foto de perfil"
                >
                  <Text className="text-destructive">Remover foto</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </Pressable>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
