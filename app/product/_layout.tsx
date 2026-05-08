import { Stack } from 'expo-router';

export default function ProductLayout() {
  return (
    <Stack>
      <Stack.Screen name="new" options={{ title: 'Adicionar produto' }} />
      <Stack.Screen name="[id]" options={{ title: 'Produto' }} />
      <Stack.Screen name="edit" options={{ headerShown: false }} />
      <Stack.Screen name="scan" options={{ headerShown: false }} />
    </Stack>
  );
}
