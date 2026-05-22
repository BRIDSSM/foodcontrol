import { addDays, set, startOfDay } from 'date-fns';

import { isExpoGo } from '@/lib/platform';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/features/inventory/queries';

function loadNotifications(): typeof import('expo-notifications') {
  return require('expo-notifications');
}

const HOUR = 9;
const MAX_PRODUCTS = 20; // 20 produtos × 3 triggers = 60 < limite iOS de 64

type TriggerKind = 'warning' | 'expiry' | 'expired';

interface Trigger {
  date: Date;
  kind: TriggerKind;
  body: string;
}

function at9(date: Date): Date {
  return set(date, { hours: HOUR, minutes: 0, seconds: 0, milliseconds: 0 });
}

function computeTriggers(name: string, expirationDateStr: string, warningDays: number): Trigger[] {
  const now = new Date();
  const expiry = startOfDay(new Date(expirationDateStr + 'T12:00:00'));

  const candidates: Trigger[] = [
    {
      date: at9(addDays(expiry, -warningDays)),
      kind: 'warning',
      body: `${name} vence em ${warningDays} dias`,
    },
    {
      date: at9(expiry),
      kind: 'expiry',
      body: `${name} vence hoje`,
    },
    {
      date: at9(addDays(expiry, 1)),
      kind: 'expired',
      body: `${name} venceu ontem`,
    },
  ];

  return candidates.filter((t) => t.date > now);
}

export async function scheduleProductNotifications(
  product: Product,
  warningDays: number,
): Promise<void> {
  if (isExpoGo) return;
  await cancelProductNotifications(product.id);

  const Notifications = loadNotifications();
  const triggers = computeTriggers(product.name, product.expiration_date, warningDays);
  for (const t of triggers) {
    await Notifications.scheduleNotificationAsync({
      identifier: `${product.id}-${t.kind}`,
      content: { title: 'FoodControl', body: t.body, sound: true },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: t.date },
    });
  }
}

export async function cancelProductNotifications(productId: string): Promise<void> {
  if (isExpoGo) return;
  const Notifications = loadNotifications();
  const kinds: TriggerKind[] = ['warning', 'expiry', 'expired'];
  await Promise.all(
    kinds.map((k) => Notifications.cancelScheduledNotificationAsync(`${productId}-${k}`)),
  );
}

export async function rescheduleAllNotifications(
  userId: string,
  warningDays: number,
): Promise<void> {
  if (isExpoGo) return;
  const Notifications = loadNotifications();
  await Notifications.cancelAllScheduledNotificationsAsync();

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', userId)
    .order('expiration_date', { ascending: true })
    .limit(MAX_PRODUCTS);

  if (error || !products) return;

  for (const product of products) {
    await scheduleProductNotifications(product, warningDays);
  }
}
