import { View } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import { Text } from '@/components/ui/text';

type Props = {
  Illustration: React.FC<SvgProps>;
  title: string;
  description?: string;
  size?: number;
};

export function EmptyState({ Illustration, title, description, size = 180 }: Props) {
  return (
    <View className="flex-1 items-center justify-center gap-3 px-8 py-6">
      <Illustration width={size} height={size} />
      <View className="items-center gap-1">
        <Text variant="large">{title}</Text>
        {description && (
          <Text variant="muted" className="text-center">
            {description}
          </Text>
        )}
      </View>
    </View>
  );
}
