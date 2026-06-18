import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect } from 'expo-router';
import {
  Archive,
  CalendarDays,
  Camera,
  ChevronDown,
  ImagePlus,
  Refrigerator,
  Snowflake,
  TriangleAlert,
  X,
} from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Text } from '@/components/ui/text';
import { CATEGORY_LABELS } from '@/constants/labels';
import { useAuth } from '@/contexts/auth';
import { useCreateProduct } from '@/features/inventory/mutations';
import {
  downloadAndUploadImage,
  isLocalUri,
  isSupabaseStorageUrl,
  uploadProductImage,
} from '@/features/storage/upload';
import { useProductLookup } from '@/hooks/use-product-lookup';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { diffInDays, formatDate } from '@/lib/date';
import { getTheme } from '@/lib/theme';
import { CATEGORIES, productSchema, type ProductFormData } from '@/schemas/product';
import { mapCosmosToCategory } from '@/services/cosmos';
import { useScanStore } from '@/stores/scan';
import type { Enums } from '@/types/database';
import { isValidGS1 } from '@/utils/barcode';

const LOCATION_CHIPS: {
  key: Enums<'storage_location'>;
  label: string;
  Icon: React.ComponentType<{ size: number; color: string }>;
}[] = [
  { key: 'despensa', label: 'Despensa', Icon: Archive },
  { key: 'geladeira', label: 'Geladeira', Icon: Refrigerator },
  { key: 'congelador', label: 'Congelador', Icon: Snowflake },
];

export default function AddProductScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = getTheme(colorScheme);
  const { user } = useAuth();
  const { mutate: createProduct, isPending } = useCreateProduct();
  const insets = useSafeAreaInsets();

  const scanData = useScanStore((s) => s.data);
  const clearScan = useScanStore((s) => s.clear);

  const { state: barcodeState, lookup: lookupBarcode } = useProductLookup();
  const [barcodeInvalid, setBarcodeInvalid] = useState(false);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      barcode: '',
      category: 'outros',
      quantity: 1,
      storage_location: 'despensa',
      expiration_date: '',
    },
  });

  useEffect(() => {
    if (barcodeState.status !== 'success') return;
    const p = barcodeState.product;
    if (!form.getValues('name')) form.setValue('name', p.description ?? '');
    form.setValue('category', mapCosmosToCategory(p.category?.description));
    if (p.thumbnail && !form.getValues('image_url')) form.setValue('image_url', p.thumbnail);
  }, [barcodeState]);

  // Preenche o formulário com dados do scanner ao retornar da tela de scan
  useFocusEffect(
    useCallback(() => {
      if (!scanData) return;
      form.setValue('name', scanData.name);
      form.setValue('barcode', scanData.barcode);
      form.setValue('category', scanData.category);
      if (scanData.image_url) form.setValue('image_url', scanData.image_url);
      clearScan();
    }, [scanData]),
  );

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
    if (!result.canceled && result.assets[0]) {
      form.setValue('image_url', result.assets[0].uri, { shouldDirty: true });
    }
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
    if (!result.canceled && result.assets[0]) {
      form.setValue('image_url', result.assets[0].uri, { shouldDirty: true });
    }
  }

  async function onSubmit(values: ProductFormData) {
    if (!user) return;

    let imageUrl = values.image_url ?? null;
    if (imageUrl && !isSupabaseStorageUrl(imageUrl)) {
      try {
        imageUrl = isLocalUri(imageUrl)
          ? await uploadProductImage(imageUrl, user.id)
          : await downloadAndUploadImage(imageUrl, user.id);
      } catch {
        imageUrl = isLocalUri(imageUrl) ? null : imageUrl;
      }
    }

    createProduct(
      {
        name: values.name,
        barcode: values.barcode ?? null,
        category: values.category,
        storage_location: values.storage_location,
        quantity: values.quantity,
        expiration_date: values.expiration_date,
        image_url: imageUrl,
        user_id: user.id,
      },
      {
        onSuccess: () => router.back(),
      },
    );
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-background" behavior="padding">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ gap: 20, padding: 16, paddingBottom: 40 + insets.bottom }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Imagem do produto */}
        <Controller
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <View className="items-center gap-2">
              <Pressable
                onPress={() => setShowImageOptions(true)}
                accessibilityLabel="Selecionar ou tirar foto do produto"
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: 16,
                  overflow: 'hidden',
                  borderWidth: 1.5,
                  borderColor: theme.border,
                  borderStyle: field.value ? 'solid' : 'dashed',
                  backgroundColor: theme.card,
                }}
                className="items-center justify-center"
              >
                {field.value ? (
                  <>
                    <Image
                      source={{ uri: field.value }}
                      style={{ width: 140, height: 140 }}
                      contentFit="contain"
                      transition={150}
                    />
                    <Pressable
                      onPress={() => form.setValue('image_url', undefined)}
                      accessibilityLabel="Remover imagem"
                      style={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        backgroundColor: 'rgba(0,0,0,0.55)',
                        borderRadius: 12,
                        padding: 3,
                      }}
                    >
                      <X size={14} color="#fff" />
                    </Pressable>
                  </>
                ) : (
                  <View className="items-center gap-1.5">
                    <ImagePlus size={28} color={theme.mutedForeground} />
                    <Text className="text-xs text-muted-foreground">Adicionar foto</Text>
                  </View>
                )}
              </Pressable>
            </View>
          )}
        />

        {/* Modal seleção de imagem */}
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
              <Text className="px-4 pb-3 text-base font-semibold">Adicionar foto</Text>
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
            </View>
          </Pressable>
        </Modal>

        {/* Scanner */}
        <Button
          variant="outline"
          className="w-full flex-row items-center gap-2"
          accessibilityLabel="Escanear código de barras"
          onPress={() => router.push('/product/scan')}
        >
          <Camera size={16} color={theme.foreground} />
          <Text>Escanear código de barras</Text>
        </Button>

        {/* Nome */}
        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <View className="gap-1">
              <FormField
                label="Nome *"
                nativeID="prod-name"
                placeholder="Ex: Leite integral 1L"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
              />
              {fieldState.error && (
                <View className="flex-row items-center gap-1">
                  <TriangleAlert size={12} color={theme.destructive} />
                  <Text className="text-xs text-destructive">{fieldState.error.message}</Text>
                </View>
              )}
            </View>
          )}
        />

        {/* Código de barras */}
        <Controller
          control={form.control}
          name="barcode"
          render={({ field }) => (
            <View className="gap-1">
              <FormField
                label="Código de barras"
                nativeID="prod-barcode"
                placeholder="Preenchido pelo scanner ou manual"
                value={field.value}
                onChangeText={(v) => {
                  field.onChange(v);
                  setBarcodeInvalid(false);
                }}
                onBlur={() => {
                  field.onBlur();
                  const val = form.getValues('barcode');
                  if (!val) return;
                  if (isValidGS1(val)) {
                    lookupBarcode(val);
                  } else {
                    setBarcodeInvalid(true);
                  }
                }}
                keyboardType="numeric"
              />
              {barcodeInvalid && (
                <View className="flex-row items-center gap-1">
                  <TriangleAlert size={12} color={theme.destructive} />
                  <Text className="text-xs text-destructive">Código de barras inválido.</Text>
                </View>
              )}
              {!barcodeInvalid && barcodeState.status === 'loading' && (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator size="small" color={theme.primary} />
                  <Text className="text-xs text-muted-foreground">Buscando produto...</Text>
                </View>
              )}
              {!barcodeInvalid && barcodeState.status === 'success' && (
                <Text className="text-xs text-primary">Dados preenchidos automaticamente.</Text>
              )}
              {!barcodeInvalid && barcodeState.status === 'error' && (
                <Text className="text-xs text-muted-foreground">
                  Produto não encontrado, preencha manualmente.
                </Text>
              )}
            </View>
          )}
        />

        {/* Categoria */}
        <Controller
          control={form.control}
          name="category"
          render={({ field, fieldState }) => (
            <View className="gap-2">
              <Text className="text-sm font-medium text-foreground">Categoria *</Text>
              <Pressable
                onPress={() => setShowCategoryModal(true)}
                accessibilityLabel="Selecionar categoria"
                className="flex-row items-center justify-between rounded-md border border-input bg-background px-4 py-3"
              >
                <Text className={field.value ? 'text-foreground' : 'text-muted-foreground'}>
                  {CATEGORY_LABELS[field.value]}
                </Text>
                <ChevronDown size={16} color={theme.mutedForeground} />
              </Pressable>
              {fieldState.error && (
                <View className="flex-row items-center gap-1">
                  <TriangleAlert size={12} color={theme.destructive} />
                  <Text className="text-xs text-destructive">{fieldState.error.message}</Text>
                </View>
              )}

              {/* Modal de seleção */}
              <Modal
                visible={showCategoryModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowCategoryModal(false)}
              >
                <Pressable
                  className="flex-1 bg-black/50"
                  onPress={() => setShowCategoryModal(false)}
                >
                  <View className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-card pb-8">
                    <View className="items-center py-3">
                      <View className="h-1 w-10 rounded-full bg-muted-foreground/30" />
                    </View>
                    <Text className="px-4 pb-3 text-base font-semibold">Categoria</Text>
                    {CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => {
                          field.onChange(cat);
                          setShowCategoryModal(false);
                        }}
                        className="flex-row items-center justify-between px-4 py-3.5"
                        accessibilityLabel={CATEGORY_LABELS[cat]}
                      >
                        <Text className={cat === field.value ? 'font-semibold text-primary' : ''}>
                          {CATEGORY_LABELS[cat]}
                        </Text>
                        {cat === field.value && (
                          <View className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </Pressable>
              </Modal>
            </View>
          )}
        />

        {/* Quantidade */}
        <Controller
          control={form.control}
          name="quantity"
          render={({ field, fieldState }) => (
            <View className="gap-1">
              <FormField
                label="Quantidade *"
                nativeID="prod-quantity"
                placeholder="1"
                keyboardType="decimal-pad"
                value={field.value === 0 ? '' : String(field.value)}
                onChangeText={(v) => field.onChange(parseFloat(v.replace(',', '.')) || 0)}
                onBlur={field.onBlur}
              />
              {fieldState.error && (
                <View className="flex-row items-center gap-1">
                  <TriangleAlert size={12} color={theme.destructive} />
                  <Text className="text-xs text-destructive">{fieldState.error.message}</Text>
                </View>
              )}
            </View>
          )}
        />

        {/* Local de armazenamento */}
        <Controller
          control={form.control}
          name="storage_location"
          render={({ field }) => (
            <View className="gap-2">
              <Text className="text-sm font-medium text-foreground">Local de armazenamento *</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {LOCATION_CHIPS.map(({ key, label, Icon }) => {
                  const active = field.value === key;
                  const iconColor = active ? theme.primaryForeground : theme.mutedForeground;
                  return (
                    <Pressable
                      key={key}
                      onPress={() => field.onChange(key)}
                      accessibilityLabel={label}
                      className="flex-row items-center gap-1.5 rounded-full border px-3 py-1.5"
                      style={{
                        borderColor: active ? theme.primary : theme.border,
                        backgroundColor: active ? theme.primary : 'transparent',
                      }}
                    >
                      <Icon size={12} color={iconColor} />
                      <Text
                        className="text-xs font-medium"
                        style={{ color: active ? theme.primaryForeground : theme.mutedForeground }}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}
        />

        {/* Data de validade */}
        <Controller
          control={form.control}
          name="expiration_date"
          render={({ field, fieldState }) => (
            <View className="gap-2">
              <Text className="text-sm font-medium text-foreground">Data de validade *</Text>
              <Pressable
                onPress={() => setShowDatePicker(true)}
                accessibilityLabel="Selecionar data de validade"
                className="flex-row items-center justify-between rounded-md border border-input bg-background px-4 py-3"
              >
                <Text className={field.value ? 'text-foreground' : 'text-muted-foreground'}>
                  {field.value ? formatDate(field.value) : 'DD/MM/AAAA'}
                </Text>
                <CalendarDays size={16} color={theme.mutedForeground} />
              </Pressable>
              {fieldState.error && (
                <View className="flex-row items-center gap-1">
                  <TriangleAlert size={12} color={theme.destructive} />
                  <Text className="text-xs text-destructive">{fieldState.error.message}</Text>
                </View>
              )}
              {field.value && diffInDays(field.value) < 0 && (
                <View className="flex-row items-center gap-1">
                  <TriangleAlert size={12} color={theme.destructive} />
                  <Text className="text-xs text-muted-foreground">
                    Data no passado, produto já vencido
                  </Text>
                </View>
              )}

              {showDatePicker && (
                <DateTimePicker
                  value={field.value ? new Date(field.value + 'T12:00:00') : new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onValueChange={(_event, date: Date) => {
                    if (Platform.OS === 'android') setShowDatePicker(false);
                    const y = date.getFullYear();
                    const m = String(date.getMonth() + 1).padStart(2, '0');
                    const d = String(date.getDate()).padStart(2, '0');
                    field.onChange(`${y}-${m}-${d}`);
                  }}
                  onDismiss={() => setShowDatePicker(false)}
                />
              )}
            </View>
          )}
        />

        {/* Salvar */}
        <Button
          className="w-full"
          accessibilityLabel="Salvar produto"
          onPress={form.handleSubmit(onSubmit)}
          disabled={form.formState.isSubmitting || isPending}
        >
          <Text>{form.formState.isSubmitting || isPending ? 'Salvando…' : 'Salvar produto'}</Text>
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
