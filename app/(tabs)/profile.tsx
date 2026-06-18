import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MenuRow } from '@/components/profile/menu-row';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { SkeletonCircle, SkeletonText } from '@/components/ui/skeletons';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/contexts/auth';
import { useProfile } from '@/features/profile/queries';
import { supabase } from '@/lib/supabase';
import { initials } from '@/lib/utils';

export default function ProfileScreen() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const [signingOut, setSigningOut] = useState(false);
  const [imageReady, setImageReady] = useState(false);

  const displayName = profile?.full_name ?? user?.user_metadata?.full_name ?? '';
  const email = user?.email ?? '';

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    await supabase.auth.signOut();
    setSigningOut(false);
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 20, paddingBottom: 32 }}>
          {/* Avatar + dados do usuário skeleton */}
          <View className="items-center gap-3 py-6">
            <SkeletonCircle size={80} />
            <View className="items-center gap-1.5">
              <SkeletonText width={140} height={20} />
              <SkeletonText width={180} height={14} />
            </View>
          </View>

          {/* Menu principal skeleton */}
          <Card className="gap-0 py-0">
            <MenuRow label="Editar perfil" onPress={() => {}} disabled />
            <MenuRow label="Configurações" onPress={() => {}} disabled />
          </Card>

          {/* Sair skeleton */}
          <Card className="gap-0 py-0">
            <MenuRow label="Sair" onPress={() => {}} destructive disabled />
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 20, paddingBottom: 32 }}>
        {/* Avatar + dados do usuário */}
        <View className="items-center gap-3 py-6">
          <Avatar alt="Foto do usuário" className="h-20 w-20">
            {profile?.avatar_url ? (
              <AvatarImage
                source={{ uri: profile.avatar_url }}
                onLoad={() => setImageReady(true)}
              />
            ) : null}
            {!imageReady && (
              <AvatarFallback>
                <Text className="text-2xl font-semibold">{initials(displayName)}</Text>
              </AvatarFallback>
            )}
          </Avatar>
          <View className="items-center gap-0.5">
            {displayName ? <Text variant="h3">{displayName}</Text> : null}
            <Text variant="muted">{email}</Text>
          </View>
        </View>

        {/* Menu principal */}
        <Card className="gap-0 py-0">
          <MenuRow label="Editar perfil" onPress={() => router.push('/profile/edit')} />
          <MenuRow label="Configurações" onPress={() => router.push('/profile/settings')} />
        </Card>

        {/* Sair */}
        <Card className="gap-0 py-0">
          <MenuRow
            label={signingOut ? 'Saindo…' : 'Sair'}
            onPress={signOut}
            destructive
            disabled={signingOut}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
