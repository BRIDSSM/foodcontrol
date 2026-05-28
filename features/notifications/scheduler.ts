import { addDays, set, startOfDay } from 'date-fns';
import * as Notifications from 'expo-notifications';

import type { Product } from '@/features/inventory/queries';
import { DEFAULT_ALERT_HOUR, DEFAULT_ALERT_MINUTE, getAlertTime } from '@/lib/alertTime';
import { supabase } from '@/lib/supabase';

const MAX_PRODUCTS = 20;

type TriggerKind = 'warning' | 'expiry' | 'expired';

interface Trigger {
  date: Date;
  kind: TriggerKind;
  body: string;
}

function atTime(date: Date, hour: number, minute: number): Date {
  return set(date, { hours: hour, minutes: minute, seconds: 0, milliseconds: 0 });
}

function computeTriggers(
  name: string,
  expirationDateStr: string,
  warningDays: number,
  hour: number,
  minute: number,
): Trigger[] {
  const now = new Date();
  const expiry = startOfDay(new Date(expirationDateStr + 'T12:00:00'));

  const candidates: Trigger[] = [
    {
      date: atTime(addDays(expiry, -warningDays), hour, minute),
      kind: 'warning',
      body: `Vence em ${warningDays} dias, consuma em breve`,
    },
    {
      date: atTime(expiry, hour, minute),
      kind: 'expiry',
      body: `Vence hoje, verifique seu estoque`,
    },
    {
      date: atTime(addDays(expiry, 1), hour, minute),
      kind: 'expired',
      body: `Venceu ontem, descarte ou registre o consumo`,
    },
  ];

  return candidates.filter((t) => t.date > now);
}

export async function scheduleProductNotifications(
  product: Product,
  warningDays: number,
  hour = DEFAULT_ALERT_HOUR,
  minute = DEFAULT_ALERT_MINUTE,
): Promise<void> {
  await cancelProductNotifications(product.id);

  const triggers = computeTriggers(
    product.name,
    product.expiration_date,
    warningDays,
    hour,
    minute,
  );

  for (const t of triggers) {
    await Notifications.scheduleNotificationAsync({
      identifier: `${product.id}-${t.kind}`,
      content: {
        title: product.name,
        subtitle: 'Alerta de validade',
        body: t.body,
        sound: true,
        data: { productId: product.id },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: t.date },
    });
  }
}

export async function cancelProductNotifications(productId: string): Promise<void> {
  const kinds: TriggerKind[] = ['warning', 'expiry', 'expired'];
  await Promise.all(
    kinds.map((k) => Notifications.cancelScheduledNotificationAsync(`${productId}-${k}`)),
  );
}

export async function rescheduleAllNotifications(
  userId: string,
  warningDays: number,
): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const { hour, minute } = await getAlertTime();

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', userId)
    .order('expiration_date', { ascending: true })
    .limit(MAX_PRODUCTS);

  if (error || !products) return;

  for (const product of products) {
    await scheduleProductNotifications(product, warningDays, hour, minute);
  }
}
