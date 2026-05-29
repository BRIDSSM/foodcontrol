import { useFocusEffect } from 'expo-router';
import { CheckCircle2, Leaf, Trash2 } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryBar } from '@/components/stats/category-bar';
import { MetricCard } from '@/components/stats/metric-card';
import { MonthlyChart } from '@/components/stats/monthly-chart';
import { StatsEmptyState } from '@/components/stats/stats-empty-state';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import {
  PERIOD_LABELS,
  useMonthlyUtilization,
  useStats,
  type Period,
} from '@/features/stats/queries';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getTheme, STATUS_COLORS } from '@/lib/theme';

const PERIODS: Period[] = ['7d', '30d', '90d', '12m'];

export default function StatsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = getTheme(colorScheme);
  const palette = STATUS_COLORS[colorScheme];

  const [period, setPeriod] = useState<Period>('7d');
  const { data: stats, isLoading, refetch } = useStats(period);
  const { data: monthlyData } = useMonthlyUtilization();
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);

  async function handleRefresh() {
    setIsPullRefreshing(true);
    await refetch();
    setIsPullRefreshing(false);
  }

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const progressWidth = useSharedValue(0);
  const progressStyle = useAnimatedStyle(() => ({ width: `${progressWidth.value}%` }));

  useEffect(() => {
    progressWidth.value = withTiming(stats?.utilizationRate ?? 0, {
      duration: 800,
      easing: Easing.out(Easing.quad),
    });
  }, [stats?.utilizationRate]);

  const maxCategoryTotal = stats ? Math.max(...stats.byCategory.map((c) => c.total), 1) : 1;

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background" edges={['top']}>
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isPullRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
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

        {!stats || stats.total === 0 ? (
          <StatsEmptyState />
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
                <Animated.View
                  className="h-full rounded-full"
                  style={[{ backgroundColor: palette.safe }, progressStyle]}
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

        {/* Aproveitamento mensal - últimos 6 meses */}
        {monthlyData ? (
          <View className="gap-3 rounded-xl border border-border bg-card p-4">
            <Text className="font-semibold">Aproveitamento mensal</Text>
            <Text className="text-xs text-muted-foreground">Últimos 6 meses</Text>
            <MonthlyChart
              data={monthlyData}
              color={palette.safe}
              gridColor={theme.border}
              labelColor={theme.mutedForeground}
            />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
