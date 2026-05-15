import { BarChart3, CheckCircle2, Leaf, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getTheme, STATUS_COLORS } from '@/lib/theme';
import { type Period, PERIOD_LABELS, useStats, type CategoryStat } from '@/features/stats/queries';

const PERIODS: Period[] = ['7d', '30d', '90d', '12m'];

function MetricCard({
  label,
  value,
  sub,
  iconColor,
  Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  iconColor: string;
  Icon: React.ComponentType<{ size: number; color: string }>;
}) {
  return (
    <View className="flex-1 gap-1.5 rounded-xl border border-border bg-card p-4">
      <View className="flex-row items-center gap-1.5">
        <Icon size={14} color={iconColor} />
        <Text className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </Text>
      </View>
      <Text className="text-3xl font-bold" style={{ color: iconColor }}>
        {value}
      </Text>
      {sub ? <Text className="text-xs text-muted-foreground">{sub}</Text> : null}
    </View>
  );
}

function CategoryBar({ stat, max }: { stat: CategoryStat; max: number }) {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = STATUS_COLORS[colorScheme];
  const consumedPct = max > 0 ? (stat.consumed / max) * 100 : 0;
  const discardedPct = max > 0 ? (stat.discarded / max) * 100 : 0;

  return (
    <View className="gap-1">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm" numberOfLines={1}>
          {stat.label}
        </Text>
        <Text className="text-xs text-muted-foreground">{stat.total}</Text>
      </View>
      <View className="flex-row gap-1">
        {stat.consumed > 0 ? (
          <View
            style={{
              width: `${consumedPct}%`,
              height: 8,
              backgroundColor: palette.safe,
              borderRadius: 4,
            }}
          />
        ) : null}
        {stat.discarded > 0 ? (
          <View
            style={{
              width: `${discardedPct}%`,
              height: 8,
              backgroundColor: palette.expired,
              borderRadius: 4,
            }}
          />
        ) : null}
      </View>
    </View>
  );
}

function EmptyState() {
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

export default function StatsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = getTheme(colorScheme);
  const palette = STATUS_COLORS[colorScheme];

  const [period, setPeriod] = useState<Period>('30d');
  const { data: stats, isLoading } = useStats(period);

  const maxCategoryTotal = stats ? Math.max(...stats.byCategory.map((c) => c.total), 1) : 1;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="gap-3 pt-2">
          <Text className="text-2xl font-bold">Estatísticas</Text>

          {/* Chips de período */}
          <View className="flex-row gap-2">
            {PERIODS.map((p) => {
              const active = p === period;
              return (
                <Pressable
                  key={p}
                  onPress={() => setPeriod(p)}
                  accessibilityLabel={PERIOD_LABELS[p]}
                  className="rounded-full border px-3 py-1.5"
                  style={{
                    borderColor: active ? theme.primary : theme.border,
                    backgroundColor: active ? theme.primary : 'transparent',
                  }}
                >
                  <Text
                    className="text-xs font-medium"
                    style={{ color: active ? theme.primaryForeground : theme.mutedForeground }}
                  >
                    {PERIOD_LABELS[p]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {isLoading ? (
          <View className="items-center py-16">
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : !stats || stats.total === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Taxa de aproveitamento */}
            <View className="gap-3 rounded-xl border border-border bg-card p-4">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Taxa de aproveitamento
                  </Text>
                  <Text className="text-4xl font-bold" style={{ color: palette.safe }}>
                    {stats.utilizationRate}%
                  </Text>
                </View>
                <Text className="text-right text-xs text-muted-foreground">
                  {stats.consumed} de {stats.total} itens{'\n'}consumidos
                </Text>
              </View>
              {/* Barra de progresso */}
              <View
                className="h-3 overflow-hidden rounded-full"
                style={{ backgroundColor: theme.muted }}
              >
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${stats.utilizationRate}%`,
                    backgroundColor: palette.safe,
                  }}
                />
              </View>
            </View>

            {/* Consumidos / Descartados */}
            <View className="flex-row gap-3">
              <MetricCard
                label="Consumidos"
                value={String(stats.consumed)}
                sub={`${stats.consumedQty % 1 === 0 ? stats.consumedQty : stats.consumedQty.toFixed(1)} un. totais`}
                iconColor={palette.safe}
                Icon={CheckCircle2}
              />
              <MetricCard
                label="Descartados"
                value={String(stats.discarded)}
                sub={`${stats.discardedQty % 1 === 0 ? stats.discardedQty : stats.discardedQty.toFixed(1)} un. totais`}
                iconColor={palette.expired}
                Icon={Trash2}
              />
            </View>

            {/* Desperdício evitado */}
            <MetricCard
              label="Desperdício evitado"
              value={String(stats.avoidedWaste)}
              sub="consumidos antes do vencimento"
              iconColor={theme.primary}
              Icon={Leaf}
            />

            {/* Por categoria */}
            {stats.byCategory.length > 0 ? (
              <View className="gap-4 rounded-xl border border-border bg-card p-4">
                <Text className="font-semibold">Por categoria</Text>

                {/* Legenda */}
                <View className="flex-row gap-4">
                  <View className="flex-row items-center gap-1.5">
                    <View
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: palette.safe }}
                    />
                    <Text className="text-xs text-muted-foreground">Consumido</Text>
                  </View>
                  <View className="flex-row items-center gap-1.5">
                    <View
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: palette.expired }}
                    />
                    <Text className="text-xs text-muted-foreground">Descartado</Text>
                  </View>
                </View>

                <Separator />

                <View className="gap-4">
                  {stats.byCategory.map((stat) => (
                    <CategoryBar key={stat.category} stat={stat} max={maxCategoryTotal} />
                  ))}
                </View>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
