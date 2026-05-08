import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';

function StatCard({
  title,
  description,
  value,
  children,
}: {
  title: string;
  description?: string;
  value: string;
  children?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="gap-3">
        <Text variant="h1">{value}</Text>
        {children}
      </CardContent>
    </Card>
  );
}

export default function StatsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}>
        <View className="pb-2 pt-3">
          <Text variant="h2">Estatísticas</Text>
          {/* TODO: chips de período — 7d | 30d | 90d | 12m */}
          <Text variant="muted">Último mês</Text>
        </View>

        {/* Taxa de aproveitamento */}
        {/* TODO: conectar ao RPC get_user_stats(period) via TanStack Query */}
        <StatCard
          title="Taxa de aproveitamento"
          description="Consumido / total removido no período"
          value="—%"
        >
          {/* Barra de progresso — preenchida com a taxa real */}
          <View className="h-2 overflow-hidden rounded-full bg-muted">
            <View className="h-full w-0 rounded-full bg-status-safe" />
          </View>
        </StatCard>

        {/* Consumidos vs Descartados */}
        <View className="flex-row gap-3">
          <StatCard title="Consumidos" value="—">
            <Text variant="muted">itens</Text>
          </StatCard>
          <StatCard title="Descartados" value="—">
            <Text variant="muted">itens</Text>
          </StatCard>
        </View>

        {/* Desperdício evitado */}
        <StatCard
          title="Desperdício evitado"
          description="Consumidos antes do vencimento"
          value="—"
        >
          <View className="flex-row items-center gap-2">
            <View className="h-3 w-3 rounded-full bg-status-safe" />
            <Text variant="muted" className="text-sm">
              Itens consumidos antes do prazo
            </Text>
          </View>
        </StatCard>

        {/* TODO: gráfico barra/pizza — consumido vs descartado por categoria (usar chart-1..5) */}
        {/* TODO: gráfico linha — taxa de aproveitamento mês a mês (últimos 6 meses) */}
      </ScrollView>
    </SafeAreaView>
  );
}
