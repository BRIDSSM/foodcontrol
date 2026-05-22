import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import {
  Archive,
  Barcode,
  CheckCircle2,
  Package,
  Pencil,
  Refrigerator,
  Snowflake,
  Trash2,
  TriangleAlert,
} from 'lucide-react-native';

import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActionSheet } from '@/components/product/action-sheet';
import { InfoRow } from '@/components/product/info-row';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { CATEGORY_LABELS, LOCATION_LABELS } from '@/constants/labels';
import { useProduct } from '@/features/inventory/queries';
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

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: product, isLoading, error } = useProduct(id);
  const colorScheme = useColorScheme() ?? 'light';
  const theme = getTheme(colorScheme);
  const palette = STATUS_COLORS[colorScheme];
  const insets = useSafeAreaInsets();

  const [action, setAction] = useState<'consumido' | 'descartado' | null>(null);

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
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              onPress={() => router.push(`/product/edit/${id}`)}
              accessibilityLabel="Editar produto"
              style={{ padding: 4 }}
            >
              <Pencil size={20} color={theme.foreground} />
            </Pressable>
          ),
        }}
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 96 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View
          className="items-center justify-center overflow-hidden rounded-b-3xl"
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
            <View
              className="h-28 w-28 items-center justify-center rounded-3xl"
              style={{ backgroundColor: theme.muted }}
            >
              <Package size={52} color={theme.mutedForeground} strokeWidth={1.5} />
            </View>
          )}
        </View>

        <View className="gap-4 p-5">
          {/* Nome + status */}
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

          {/* Info card */}
          <Card className="gap-0 py-0">
            <View className="flex-row gap-6 p-4">
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

            <Separator />

            <View className="flex-row gap-6 p-4">
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

            {product.barcode ? (
              <>
                <Separator />
                <View className="p-4">
                  <InfoRow
                    label="Código de barras"
                    value={product.barcode}
                    icon={<Barcode size={14} color={theme.mutedForeground} />}
                  />
                </View>
              </>
            ) : null}
          </Card>
        </View>
      </ScrollView>

      {/* Footer fixo */}
      <View
        className="absolute bottom-0 left-0 right-0 flex-row gap-2 px-5 pt-4"
        style={{
          paddingBottom: insets.bottom + 16,
          backgroundColor: theme.background,
          borderTopWidth: 1,
          borderTopColor: theme.border,
        }}
      >
        <Button
          className="flex-1 flex-row items-center gap-1.5"
          accessibilityLabel="Registrar consumo"
          onPress={() => setAction('consumido')}
        >
          <CheckCircle2 size={14} color={theme.primaryForeground} />
          <Text className="font-semibold">Consumido</Text>
        </Button>

        <Button
          variant="destructive"
          className="flex-1 flex-row items-center gap-1.5"
          accessibilityLabel="Registrar descarte"
          onPress={() => setAction('descartado')}
        >
          <Trash2 size={14} color={theme.destructiveForeground} />
          <Text className="font-semibold">Descartado</Text>
        </Button>
      </View>

      {action ? (
        <ActionSheet
          product={product}
          destination={action}
          visible
          onClose={() => setAction(null)}
        />
      ) : null}
    </View>
  );
}
