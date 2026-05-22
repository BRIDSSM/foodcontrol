import LottieView, { type LottieViewProps } from 'lottie-react-native';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { isExpoGo } from '@/lib/platform';
import { getTheme } from '@/lib/theme';

type Props = {
  source: LottieViewProps['source'];
  title: string;
  description?: string;
  size?: number;
  FallbackIcon?: React.ComponentType<{ size: number; color: string }>;
};

export function LottieEmptyState({ source, title, description, size = 200, FallbackIcon }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = getTheme(colorScheme);

  return (
    <View className="items-center gap-3 px-8 py-16">
      {isExpoGo ? (
        FallbackIcon && (
          <View className="items-center justify-center rounded-full bg-muted p-6">
            <FallbackIcon size={48} color={theme.mutedForeground} />
          </View>
        )
      ) : (
        <LottieView source={source} autoPlay loop style={{ width: size, height: size }} />
      )}
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
