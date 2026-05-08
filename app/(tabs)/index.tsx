import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { STATUS_COLORS } from '@/lib/theme';

type StatusType = 'safe' | 'warning' | 'expired';

type StatusChipProps = {
  label: string;
  count: string;
  status: StatusType;
};

function StatusChip({ label, count, status }: StatusChipProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = STATUS_COLORS[colorScheme];

  // cores dinâmicas via style (DESIGN_SYSTEM.md §7 — "Cor fora de classes Tailwind")
  const colorMap: Record<StatusType, { text: string; bg: string }> = {
    safe: { text: palette.safe, bg: palette.safeBg },
    warning: { text: palette.warning, bg: palette.warningBg },
    expired: { text: palette.expired, bg: palette.expiredBg },
  };
  const { text, bg } = colorMap[status];

  return (
    <View className="flex-1 items-center rounded-xl py-3" style={{ backgroundColor: bg }}>
      <Text className="text-xl font-bold" style={{ color: text }}>
        {count}
      </Text>
      <Text className="text-xs text-muted-foreground">{label}</Text>
    </View>
  );
}

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="px-4 pb-3 pt-5">
          <Text variant="h2">Olá! 👋</Text>
          {/* TODO: saudação personalizada com nome do usuário */}
          <Text variant="muted">Veja o estado do seu estoque</Text>
        </View>

        {/* Resumo de status — alimentado pelos produtos carregados */}
        <View className="flex-row gap-3 px-4 pb-5">
          {/* TODO: substituir "—" pelas contagens reais de cada status */}
          <StatusChip label="Em dia" count="—" status="safe" />
          <StatusChip label="A vencer" count="—" status="warning" />
          <StatusChip label="Vencidos" count="—" status="expired" />
        </View>

        {/* TODO: barra de busca por nome */}
        {/* TODO: chips de filtro — Todos | Despensa | Geladeira | Congelador */}
        {/* TODO: dropdown de categoria */}

        {/* Estado vazio — substituído pela FlatList de ProductCard quando houver dados */}
        <View className="items-center gap-4 px-8 py-16">
          <Text className="text-7xl">🛒</Text>
          <View className="items-center gap-1">
            <Text variant="large">Estoque vazio</Text>
            <Text variant="muted" className="text-center">
              {'Adicione produtos para começar a\nmonitorar a validade'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* FAB */}
      <View className="absolute bottom-6 right-4">
        <Button
          size="lg"
          className="rounded-full px-6"
          accessibilityLabel="Adicionar produto"
          onPress={() => router.push('/product/new')}
        >
          <Text>+ Adicionar</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
