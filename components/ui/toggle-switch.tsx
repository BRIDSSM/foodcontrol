import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Pressable } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { getTheme } from '@/lib/theme';

const TRACK_WIDTH = 50;
const TRACK_HEIGHT = 28;
const THUMB_SIZE = 22;
const THUMB_PADDING = 3;

export function ToggleSwitch({
  value,
  onValueChange,
  accessibilityLabel,
}: {
  value: boolean;
  onValueChange: (v: boolean) => void;
  accessibilityLabel?: string;
}) {
  const theme = getTheme(useColorScheme() ?? 'light');

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withSpring(value ? TRACK_WIDTH - THUMB_SIZE - THUMB_PADDING : THUMB_PADDING, {
          stiffness: 300,
          damping: 25,
        }),
      },
    ],
  }));

  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      style={{
        width: TRACK_WIDTH,
        height: TRACK_HEIGHT,
        borderRadius: TRACK_HEIGHT / 2,
        backgroundColor: value ? theme.primary : theme.border,
        justifyContent: 'center',
      }}
    >
      <Animated.View
        style={[
          thumbStyle,
          {
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            borderRadius: THUMB_SIZE / 2,
            backgroundColor: '#ffffff',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.15,
            shadowRadius: 2,
            elevation: 2,
          },
        ]}
      />
    </Pressable>
  );
}
