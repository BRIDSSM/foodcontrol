import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import type { CategoryStat } from '@/features/stats/queries';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { STATUS_COLORS } from '@/lib/theme';

export function CategoryBar({ stat, max }: { stat: CategoryStat; max: number }) {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = STATUS_COLORS[colorScheme];
  const consumedPct = max > 0 ? (stat.consumed / max) * 100 : 0;
  const discardedPct = max > 0 ? (stat.discarded / max) * 100 : 0;

  return (
    <View className="gap-1">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm" numberOfLines={1}>
          {stat.label}
        </Text>
        <Text className="text-xs text-muted-foreground">{stat.total}</Text>
      </View>
      <View className="flex-row gap-1">
        {stat.consumed > 0 ? (
          <View
            style={{
              width: `${consumedPct}%`,
              height: 8,
              backgroundColor: palette.safe,
              borderRadius: 4,
            }}
          />
        ) : null}
        {stat.discarded > 0 ? (
          <View
            style={{
              width: `${discardedPct}%`,
              height: 8,
              backgroundColor: palette.expired,
              borderRadius: 4,
            }}
          />
        ) : null}
      </View>
    </View>
  );
}
