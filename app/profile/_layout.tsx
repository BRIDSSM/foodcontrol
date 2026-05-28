import { Stack } from 'expo-router';
import { View } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { getTheme } from '@/lib/theme';

export default function ProfileLayout() {
  const theme = getTheme(useColorScheme() ?? 'light');

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Stack
        screenOptions={{
          animation: 'fade',
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        <Stack.Screen name="edit" options={{ title: 'Editar perfil' }} />
        <Stack.Screen name="settings" options={{ title: 'Configurações' }} />
      </Stack>
    </View>
  );
}
