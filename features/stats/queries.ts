import { useQuery } from '@tanstack/react-query';
import { subDays, subMonths } from 'date-fns';

import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { CATEGORY_LABELS } from '@/constants/labels';
import type { Enums, Tables } from '@/types/database';

export type Period = '7d' | '30d' | '90d' | '12m';

export const PERIOD_LABELS: Record<Period, string> = {
  '7d': '7 dias',
  '30d': '30 dias',
  '90d': '90 dias',
  '12m': '12 meses',
};

export type CategoryStat = {
  category: Enums<'product_category'>;
  label: string;
  consumed: number;
  discarded: number;
  total: number;
};

export type StatsData = {
  consumed: number;
  discarded: number;
  consumedQty: number;
  discardedQty: number;
  avoidedWaste: number;
  utilizationRate: number;
  byCategory: CategoryStat[];
  total: number;
};

function periodStart(period: Period): string {
  const now = new Date();
  switch (period) {
    case '7d':
      return subDays(now, 7).toISOString();
    case '30d':
      return subDays(now, 30).toISOString();
    case '90d':
      return subDays(now, 90).toISOString();
    case '12m':
      return subMonths(now, 12).toISOString();
  }
}

function aggregate(rows: Tables<'product_removals'>[]): StatsData {
  let consumed = 0;
  let discarded = 0;
  let consumedQty = 0;
  let discardedQty = 0;
  let avoidedWaste = 0;

  const catMap = new Map<Enums<'product_category'>, { consumed: number; discarded: number }>();

  for (const row of rows) {
    if (row.destination === 'consumido') {
      consumed++;
      consumedQty += row.quantity_removed;
      if (!row.was_expired) avoidedWaste++;
    } else {
      discarded++;
      discardedQty += row.quantity_removed;
    }

    const existing = catMap.get(row.category) ?? { consumed: 0, discarded: 0 };
    catMap.set(row.category, {
      consumed: existing.consumed + (row.destination === 'consumido' ? 1 : 0),
      discarded: existing.discarded + (row.destination === 'descartado' ? 1 : 0),
    });
  }

  const total = consumed + discarded;
  const utilizationRate = total > 0 ? Math.round((consumed / total) * 100) : 0;

  const byCategory: CategoryStat[] = Array.from(catMap.entries())
    .map(([category, counts]) => ({
      category,
      label: CATEGORY_LABELS[category],
      consumed: counts.consumed,
      discarded: counts.discarded,
      total: counts.consumed + counts.discarded,
    }))
    .sort((a, b) => b.total - a.total);

  return {
    consumed,
    discarded,
    consumedQty,
    discardedQty,
    avoidedWaste,
    utilizationRate,
    byCategory,
    total,
  };
}

const MONTH_LABELS_PT = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

export type MonthlyUtilization = {
  month: string;
  rate: number;
  total: number;
};

function buildMonthlyData(
  rows: Pick<Tables<'product_removals'>, 'destination' | 'removed_at'>[],
): MonthlyUtilization[] {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(now, 5 - i);
    const y = date.getFullYear();
    const m = date.getMonth();
    const monthRows = rows.filter((r) => {
      const d = new Date(r.removed_at);
      return d.getFullYear() === y && d.getMonth() === m;
    });
    const consumed = monthRows.filter((r) => r.destination === 'consumido').length;
    const total = monthRows.length;
    return {
      month: MONTH_LABELS_PT[m],
      rate: total > 0 ? Math.round((consumed / total) * 100) : 0,
      total,
    };
  });
}

export function useMonthlyUtilization() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['stats', 'monthly', user?.id],
    queryFn: async () => {
      const start = subMonths(new Date(), 6).toISOString();
      const { data, error } = await supabase
        .from('product_removals')
        .select('destination, removed_at')
        .eq('user_id', user!.id)
        .gte('removed_at', start);
      if (error) throw error;
      return buildMonthlyData(data ?? []);
    },
    enabled: !!user,
  });
}

export function useStats(period: Period) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['stats', period, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_removals')
        .select('*')
        .eq('user_id', user!.id)
        .gte('removed_at', periodStart(period));
      if (error) throw error;
      return aggregate(data ?? []);
    },
    enabled: !!user,
  });
}
