import { BarChart3 } from 'lucide-react-native';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getTheme } from '@/lib/theme';

export function StatsEmptyState() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = getTheme(colorScheme);
  return (
    <View className="items-center gap-3 py-12">
      <BarChart3 size={48} color={theme.mutedForeground} strokeWidth={1.2} />
      <Text className="text-center text-muted-foreground">
        Nenhum produto removido neste período.{'\n'}Registre consumos ou descartes para ver as
        estatísticas.
      </Text>
    </View>
  );
}
