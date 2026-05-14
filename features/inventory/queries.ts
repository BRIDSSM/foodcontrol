import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Enums, Tables } from '@/types/database';

export type Product = Tables<'products'>;

export const inventoryKeys = {
  all: ['products'] as const,
  list: (filters?: ProductFilters) => [...inventoryKeys.all, 'list', filters] as const,
  detail: (id: string) => [...inventoryKeys.all, 'detail', id] as const,
};

export type ProductFilters = {
  storage_location?: Enums<'storage_location'>;
  category?: Enums<'product_category'>;
  search?: string;
};

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: inventoryKeys.list(filters),
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .order('expiration_date', { ascending: true });

      if (filters?.storage_location) {
        query = query.eq('storage_location', filters.storage_location);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: inventoryKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}
