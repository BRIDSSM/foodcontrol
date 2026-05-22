import LottieView, { type LottieViewProps } from 'lottie-react-native';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';

type Props = {
  source: LottieViewProps['source'];
  title: string;
  description?: string;
  size?: number;
};

export function LottieEmptyState({ source, title, description, size = 200 }: Props) {
  return (
    <View className="items-center gap-3 px-8 py-16">
      <LottieView source={source} autoPlay loop style={{ width: size, height: size }} />
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
