import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { STATUS_COLORS } from '@/lib/theme';

type StatusType = 'safe' | 'warning' | 'expired';

export function StatusChip({
  label,
  count,
  status,
}: {
  label: string;
  count: number;
  status: StatusType;
}) {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = STATUS_COLORS[colorScheme];
  const colorMap = {
    safe: { text: palette.safe, bg: palette.safeBg },
    warning: { text: palette.warning, bg: palette.warningBg },
    expired: { text: palette.expired, bg: palette.expiredBg },
  };
  const { text, bg } = colorMap[status];

  return (
    <View className="flex-1 items-center rounded-xl py-3" style={{ backgroundColor: bg }}>
      <Text className="text-xl font-bold" style={{ color: text }}>
        {count}
      </Text>
      <Text className="text-xs text-muted-foreground">{label}</Text>
    </View>
  );
}
