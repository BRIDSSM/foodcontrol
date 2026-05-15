import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getStatus } from '@/lib/status';
import type { TablesInsert, TablesUpdate } from '@/types/database';
import { inventoryKeys, type Product } from './queries';

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: TablesInsert<'products'>) => {
      const { data, error } = await supabase.from('products').insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: inventoryKeys.all }),
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inventoryKeys.all });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}
