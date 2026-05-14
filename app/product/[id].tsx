import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Archive,
  Barcode,
  CheckCircle2,
  Package,
  Refrigerator,
  Snowflake,
  Trash2,
  TriangleAlert,
} from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { CATEGORY_LABELS, LOCATION_LABELS } from '@/constants/labels';
import { useRemoveProduct } from '@/features/inventory/mutations';
import { useProduct, type Product } from '@/features/inventory/queries';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatDate, getCountdownLabel } from '@/lib/date';
import { getStatus, type ProductStatus } from '@/lib/status';
import { getTheme, STATUS_COLORS } from '@/lib/theme';
import type { Enums } from '@/types/database';

const LOCATION_ICON: Record<
  Enums<'storage_location'>,
  React.ComponentType<{ size: number; color: string }>
> = {
  despensa: Archive,
  geladeira: Refrigerator,
  congelador: Snowflake,
};

const STATUS_LABEL: Record<ProductStatus, string> = {
  safe: 'Em dia',
  warning: 'A vencer',
  expired: 'Vencido',
};

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <View className="gap-0.5">
      <Text className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </Text>
      <View className="flex-row items-center gap-1.5">
        {icon}
        <Text className="text-base font-medium">{value}</Text>
      </View>
    </View>
  );
}

type RemoveSheetProps = {
  product: Product;
  visible: boolean;
  onClose: () => void;
  onDone: () => void;
};

function RemoveProductSheet({ product, visible, onClose, onDone }: RemoveSheetProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = getTheme(colorScheme);
  const { mutate: removeProduct, isPending } = useRemoveProduct();

  const [quantityText, setQuantityText] = useState(String(product.quantity));
  const [destination, setDestination] = useState<'consumido' | 'descartado' | null>(null);

  const qty = parseFloat(quantityText.replace(',', '.'));
  const valid = destination !== null && !isNaN(qty) && qty > 0;

  function handleConfirm() {
    if (!valid) return;
    removeProduct(
      { product, quantity_removed: qty, destination: destination! },
      {
        onSuccess: () => {
          onClose();
          if (qty >= product.quantity) {
            router.back();
          } else {
            onDone();
          }
        },
      },
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/50" onPress={onClose}>
        <Pressable onPress={() => {}}>
          <View style={{ backgroundColor: theme.card }} className="rounded-t-2xl px-5 pb-10 pt-4">
            <View className="mb-4 items-center">
              <View className="h-1 w-10 rounded-full bg-muted-foreground/30" />
            </View>

            <Text className="mb-1 text-lg font-bold">Remover produto</Text>
            <Text className="mb-5 text-sm text-muted-foreground" numberOfLines={1}>
              {product.name}
            </Text>

            <Text className="mb-1.5 text-sm font-medium">Quantidade a remover</Text>
            <TextInput
              value={quantityText}
              onChangeText={setQuantityText}
              keyboardType="decimal-pad"
              style={{
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: Platform.OS === 'ios' ? 10 : 8,
                fontSize: 16,
                color: theme.foreground,
                backgroundColor: theme.background,
                marginBottom: 20,
              }}
            />

            <Text className="mb-3 text-sm font-medium">Para onde vai?</Text>
            <View className="mb-6 flex-row gap-3">
              <TouchableOpacity
                onPress={() => setDestination('consumido')}
                accessibilityLabel="Consumido"
                className="flex-1 items-center gap-2 rounded-xl border-2 py-4"
                style={{
                  borderColor: destination === 'consumido' ? theme.primary : theme.border,
                  backgroundColor:
                    destination === 'consumido' ? `${theme.primary}18` : 'transparent',
                }}
              >
                <CheckCircle2
                  size={28}
                  color={destination === 'consumido' ? theme.primary : theme.mutedForeground}
                />
                <Text
                  className="text-sm font-semibold"
                  style={{
                    color: destination === 'consumido' ? theme.primary : theme.mutedForeground,
                  }}
                >
                  Consumido
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setDestination('descartado')}
                accessibilityLabel="Descartado"
                className="flex-1 items-center gap-2 rounded-xl border-2 py-4"
                style={{
                  borderColor: destination === 'descartado' ? theme.destructive : theme.border,
                  backgroundColor:
                    destination === 'descartado' ? `${theme.destructive}18` : 'transparent',
                }}
              >
                <Trash2
                  size={28}
                  color={destination === 'descartado' ? theme.destructive : theme.mutedForeground}
                />
                <Text
                  className="text-sm font-semibold"
                  style={{
                    color: destination === 'descartado' ? theme.destructive : theme.mutedForeground,
                  }}
                >
                  Descartado
                </Text>
              </TouchableOpacity>
            </View>

            <Button
              className="w-full"
              accessibilityLabel="Confirmar remoção"
              disabled={!valid || isPending}
              onPress={handleConfirm}
              variant={destination === 'descartado' ? 'destructive' : 'default'}
            >
              <Text>{isPending ? 'Removendo…' : 'Confirmar'}</Text>
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: product, isLoading, error } = useProduct(id);
  const colorScheme = useColorScheme() ?? 'light';
  const theme = getTheme(colorScheme);
  const palette = STATUS_COLORS[colorScheme];

  const [showRemoveSheet, setShowRemoveSheet] = useState(false);
  const insets = useSafeAreaInsets();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-background px-8">
        <TriangleAlert size={36} color={theme.destructive} />
        <Text className="text-center text-muted-foreground">
          {error?.message ?? 'Produto não encontrado.'}
        </Text>
        <Button variant="outline" onPress={() => router.back()} accessibilityLabel="Voltar">
          <Text>Voltar</Text>
        </Button>
      </View>
    );
  }

  const status = getStatus(product.expiration_date);
  const statusColor = palette[status];
  const statusBg = palette[`${status}Bg`];
  const LocationIcon = LOCATION_ICON[product.storage_location];

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 96 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View
          className="items-center justify-center"
          style={{ height: 240, backgroundColor: theme.card }}
        >
          {product.image_url ? (
            <Image
              source={{ uri: product.image_url }}
              style={{ width: '100%', height: 240 }}
              contentFit="contain"
              transition={200}
            />
          ) : (
            <Package size={72} color={theme.mutedForeground} strokeWidth={1} />
          )}
        </View>

        <View className="gap-5 p-5">
          {/* Nome + badge de status */}
          <View className="gap-2">
            <View className="flex-row items-start justify-between gap-3">
              <Text className="flex-1 text-2xl font-bold leading-tight" numberOfLines={3}>
                {product.name}
              </Text>
              <View className="mt-1 rounded-full px-3 py-1" style={{ backgroundColor: statusBg }}>
                <Text className="text-xs font-semibold" style={{ color: statusColor }}>
                  {STATUS_LABEL[status]}
                </Text>
              </View>
            </View>
            <Text className="text-sm font-medium" style={{ color: statusColor }}>
              {getCountdownLabel(product.expiration_date)}
            </Text>
          </View>

          <Separator />

          {/* Campos */}
          <View className="gap-5">
            <View className="flex-row gap-6">
              <View className="flex-1">
                <InfoRow label="Categoria" value={CATEGORY_LABELS[product.category]} />
              </View>
              <View className="flex-1">
                <InfoRow
                  label="Local"
                  value={LOCATION_LABELS[product.storage_location]}
                  icon={<LocationIcon size={14} color={theme.foreground} />}
                />
              </View>
            </View>

            <View className="flex-row gap-6">
              <View className="flex-1">
                <InfoRow
                  label="Quantidade"
                  value={
                    product.quantity % 1 === 0
                      ? String(product.quantity)
                      : product.quantity.toFixed(2)
                  }
                />
              </View>
              <View className="flex-1">
                <InfoRow label="Validade" value={formatDate(product.expiration_date)} />
              </View>
            </View>

            {product.barcode ? (
              <InfoRow
                label="Código de barras"
                value={product.barcode}
                icon={<Barcode size={14} color={theme.mutedForeground} />}
              />
            ) : null}
          </View>
        </View>
      </ScrollView>

      {/* Footer fixo */}
      <View
        className="absolute bottom-0 left-0 right-0 flex-row gap-3 px-5 pt-4"
        style={{
          paddingBottom: insets.bottom + 16,
          backgroundColor: theme.background,
          borderTopWidth: 1,
          borderTopColor: theme.border,
        }}
      >
        <Button
          variant="outline"
          className="flex-1"
          accessibilityLabel="Editar produto"
          onPress={() => router.push(`/product/edit/${id}`)}
        >
          <Text>Editar</Text>
        </Button>
        <Button
          variant="destructive"
          className="flex-1"
          accessibilityLabel="Remover produto"
          onPress={() => setShowRemoveSheet(true)}
        >
          <Text>Remover</Text>
        </Button>
      </View>

      <RemoveProductSheet
        product={product}
        visible={showRemoveSheet}
        onClose={() => setShowRemoveSheet(false)}
        onDone={() => setShowRemoveSheet(false)}
      />
    </View>
  );
}
