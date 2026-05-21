import { View } from 'react-native';

import { Text } from '@/components/ui/text';

export function MetricCard({
  label,
  value,
  sub,
  iconColor,
  Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  iconColor: string;
  Icon: React.ComponentType<{ size: number; color: string }>;
}) {
  return (
    <View className="flex-1 gap-1.5 rounded-xl border border-border bg-card p-4">
      <View className="flex-row items-center gap-1.5">
        <Icon size={14} color={iconColor} />
        <Text className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </Text>
      </View>
      <Text className="text-3xl font-bold" style={{ color: iconColor }}>
        {value}
      </Text>
      {sub ? <Text className="text-xs text-muted-foreground">{sub}</Text> : null}
    </View>
  );
}
