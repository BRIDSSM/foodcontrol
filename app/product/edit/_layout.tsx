import { Stack } from 'expo-router';
import { View } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { getTheme } from '@/lib/theme';

export default function EditLayout() {
  const theme = getTheme(useColorScheme() ?? 'light');

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Stack
        screenOptions={{
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        <Stack.Screen name="[id]" options={{ title: 'Editar produto' }} />
      </Stack>
    </View>
  );
}
