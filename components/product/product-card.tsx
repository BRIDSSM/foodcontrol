import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Archive, Package, Refrigerator, Snowflake } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Text } from '@/components/ui/text';
import { CATEGORY_LABELS, LOCATION_LABELS } from '@/constants/labels';
import type { Enums } from '@/types/database';
import { getCountdownLabel } from '@/lib/date';
import { getStatus, type ProductStatus } from '@/lib/status';
import { getTheme, STATUS_COLORS } from '@/lib/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Product } from '@/features/inventory/queries';

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

type Props = {
  product: Product;
  index?: number;
  warningDays?: number;
};

export function ProductCard({ product, index = 0, warningDays = 5 }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = STATUS_COLORS[colorScheme];
  const theme = getTheme(colorScheme);
  const status = getStatus(product.expiration_date, warningDays);
  const LocationIcon = LOCATION_ICON[product.storage_location];

  const statusColor = palette[status];
  const statusBg = palette[`${status}Bg`];

  return (
    <Animated.View entering={FadeInUp.delay(Math.min(index, 8) * 40).duration(250)}>
      <Pressable
        onPress={() => router.push(`/product/${product.id}`)}
        accessibilityLabel={`Ver detalhes de ${product.name}`}
        className="active:opacity-70"
      >
        <View className="flex-row items-center gap-3 rounded-xl border border-border bg-card p-3">
          {/* Thumbnail */}
          <View className="h-16 w-16 overflow-hidden rounded-lg bg-muted">
            {product.image_url ? (
              <Image
                source={{ uri: product.image_url }}
                style={{ width: 64, height: 64 }}
                contentFit="cover"
              />
            ) : (
              <View className="h-full w-full items-center justify-center">
                <Package size={28} color={theme.mutedForeground} />
              </View>
            )}
          </View>

          {/* Info */}
          <View className="flex-1 gap-1">
            <Text className="font-semibold leading-tight" numberOfLines={1}>
              {product.name}
            </Text>
            <View className="flex-row items-center gap-1">
              <Text variant="muted" className="text-xs">
                {CATEGORY_LABELS[product.category]} ·{' '}
              </Text>
              <LocationIcon size={11} color={theme.mutedForeground} />
              <Text variant="muted" className="text-xs">
                {LOCATION_LABELS[product.storage_location]}
              </Text>
            </View>
            <Text variant="muted" className="text-xs">
              Qtd: {product.quantity % 1 === 0 ? product.quantity : product.quantity.toFixed(2)}
            </Text>
          </View>

          {/* Status + countdown */}
          <View className="items-end gap-1.5">
            <View
              className="rounded-full px-2.5 py-0.5"
              style={{ backgroundColor: statusBg }}
              accessibilityLabel={`Status: ${STATUS_LABEL[status]}`}
            >
              <Text className="text-xs font-medium" style={{ color: statusColor }}>
                {STATUS_LABEL[status]}
              </Text>
            </View>
            <Text className="text-right text-xs" style={{ color: statusColor }} numberOfLines={2}>
              {getCountdownLabel(product.expiration_date)}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
