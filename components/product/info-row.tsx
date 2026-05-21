import { View } from 'react-native';

import { Text } from '@/components/ui/text';

export function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
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
