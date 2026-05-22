import { Stack } from 'expo-router';
import { View } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { getTheme } from '@/lib/theme';

export default function ProductLayout() {
  const theme = getTheme(useColorScheme() ?? 'light');

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Stack
        screenOptions={{
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        <Stack.Screen name="new" options={{ title: 'Adicionar produto' }} />
        <Stack.Screen name="[id]" options={{ title: 'Produto' }} />
        <Stack.Screen name="edit" options={{ headerShown: false }} />
        <Stack.Screen name="scan" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}
