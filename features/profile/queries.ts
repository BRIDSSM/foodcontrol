import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import type { TablesUpdate } from '@/types/database';

export const profileKeys = {
  detail: (uid: string) => ['profile', uid] as const,
};

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: profileKeys.detail(user?.id ?? ''),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useUpdateProfile() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: TablesUpdate<'profiles'>) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(input)
        .eq('id', user!.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: profileKeys.detail(user?.id ?? '') }),
  });
}
