import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getStatus } from '@/lib/status';
import type { Tables, TablesInsert, TablesUpdate } from '@/types/database';
import {
  cancelProductNotifications,
  scheduleProductNotifications,
} from '@/features/notifications/scheduler';
import { getAlertTime } from '@/lib/alertTime';
import { inventoryKeys, type Product } from './queries';

async function getProfileWithFallback(
  qc: ReturnType<typeof useQueryClient>,
  userId: string,
): Promise<Tables<'profiles'> | null> {
  const cached = qc.getQueryData<Tables<'profiles'>>(['profile', userId]);
  if (cached) return cached;

  if (__DEV__) console.log('[Mutations] Profile não encontrado no cache, buscando do Supabase...');
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

  if (error || !data) {
    if (__DEV__) console.warn('[Mutations] Não foi possível buscar profile:', error?.message);
    return null;
  }
  return data;
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: TablesInsert<'products'>) => {
      const { data, error } = await supabase.from('products').insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: inventoryKeys.all });
      getProfileWithFallback(qc, data.user_id).then(async (profile) => {
        if (profile?.notifications_enabled) {
          if (__DEV__)
            console.log('[Mutations] Agendando notificações para novo produto:', data.name);
          const { hour, minute } = await getAlertTime();
          scheduleProductNotifications(
            data,
            profile.warning_days_before_expiry,
            hour,
            minute,
          ).catch((err) => {
            if (__DEV__) console.error('[Mutations] Erro ao agendar:', err);
          });
        } else if (__DEV__) {
          console.log('[Mutations] Notificações desabilitadas ou profile não encontrado');
        }
      });
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: TablesUpdate<'products'> & { id: string }) => {
      const { data, error } = await supabase
        .from('products')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: inventoryKeys.all });
      qc.invalidateQueries({ queryKey: inventoryKeys.detail(data.id) });
      getProfileWithFallback(qc, data.user_id).then(async (profile) => {
        if (profile?.notifications_enabled) {
          if (__DEV__) console.log('[Mutations] Reagendando notificações para produto:', data.name);
          const { hour, minute } = await getAlertTime();
          scheduleProductNotifications(
            data,
            profile.warning_days_before_expiry,
            hour,
            minute,
          ).catch((err) => {
            if (__DEV__) console.error('[Mutations] Erro ao reagendar:', err);
          });
        } else {
          if (__DEV__) console.log('[Mutations] Notificações desabilitadas, cancelando...');
          cancelProductNotifications(data.id).catch(() => {});
        }
      });
    },
  });
}

export type RemoveProductInput = {
  product: Product;
  quantity_removed: number;
  destination: 'consumido' | 'descartado';
  warningDays?: number;
};

export function useRemoveProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      product,
      quantity_removed,
      destination,
      warningDays = 5,
    }: RemoveProductInput) => {
      const was_expired = getStatus(product.expiration_date, warningDays) === 'expired';

      const { error: removalError } = await supabase.from('product_removals').insert({
        user_id: product.user_id,
        product_name: product.name,
        category: product.category,
        quantity_removed,
        destination,
        was_expired,
      });
      if (removalError) throw removalError;

      if (quantity_removed >= product.quantity) {
        const { error } = await supabase.from('products').delete().eq('id', product.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .update({ quantity: product.quantity - quantity_removed })
          .eq('id', product.id);
        if (error) throw error;
      }
    },
    onSuccess: (_, { product }) => {
      qc.invalidateQueries({ queryKey: inventoryKeys.all });
      qc.invalidateQueries({ queryKey: ['stats'] });
      cancelProductNotifications(product.id).catch(() => {});
    },
  });
}
