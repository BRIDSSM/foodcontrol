import { View } from 'react-native';

import { Text } from '@/components/ui/text';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-background p-4">
      <Text variant="h1">FoodControl</Text>
      <Text variant="muted">Edite app/(tabs)/index.tsx para alterar esta tela.</Text>
    </View>
  );
}
