import { useFocusEffect, router } from 'expo-router';
import {
  Archive,
  Plus,
  Refrigerator,
  Search,
  SearchX,
  ShoppingCart,
  Snowflake,
} from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductCard } from '@/components/product/product-card';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/contexts/auth';
import { useProducts } from '@/features/inventory/queries';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getStatus, type ProductStatus } from '@/lib/status';
import { getTheme, STATUS_COLORS } from '@/lib/theme';
import type { Enums } from '@/types/database';

type LocationFilter = Enums<'storage_location'> | 'todos';

type ChipDef = {
  key: LocationFilter;
  label: string;
  Icon?: React.ComponentType<{ size: number; color: string }>;
};

const LOCATION_CHIPS: ChipDef[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'despensa', label: 'Despensa', Icon: Archive },
  { key: 'geladeira', label: 'Geladeira', Icon: Refrigerator },
  { key: 'congelador', label: 'Congelador', Icon: Snowflake },
];

type StatusType = 'safe' | 'warning' | 'expired';

function StatusChip({
  label,
  count,
  status,
}: {
  label: string;
  count: number;
  status: StatusType;
}) {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = STATUS_COLORS[colorScheme];
  const colorMap = {
    safe: { text: palette.safe, bg: palette.safeBg },
    warning: { text: palette.warning, bg: palette.warningBg },
    expired: { text: palette.expired, bg: palette.expiredBg },
  };
  const { text, bg } = colorMap[status];

  return (
    <View className="flex-1 items-center rounded-xl py-3" style={{ backgroundColor: bg }}>
      <Text className="text-xl font-bold" style={{ color: text }}>
        {count}
      </Text>
      <Text className="text-xs text-muted-foreground">{label}</Text>
    </View>
  );
}

function getFirstName(user: { user_metadata?: { full_name?: string } } | null): string {
  const full = user?.user_metadata?.full_name;
  if (!full) return '';
  return full.split(' ')[0];
}

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = getTheme(colorScheme);
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState<LocationFilter>('todos');

  const { data: products = [], isLoading, refetch } = useProducts();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesLocation = locationFilter === 'todos' || p.storage_location === locationFilter;
      const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      return matchesLocation && matchesSearch;
    });
  }, [products, locationFilter, search]);

  const counts = useMemo(() => {
    const result: Record<ProductStatus, number> = { safe: 0, warning: 0, expired: 0 };
    for (const p of products) result[getStatus(p.expiration_date)]++;
    return result;
  }, [products]);

  const firstName = getFirstName(user);

  const ListHeader = (
    <View>
      {/* Header */}
      <View className="px-4 pb-3 pt-5">
        <Text variant="h2">{firstName ? `Olá, ${firstName}! 👋` : 'Olá! 👋'}</Text>
        <Text variant="muted">
          {products.length === 0
            ? 'Seu estoque está vazio'
            : `${products.length} ${products.length === 1 ? 'produto' : 'produtos'} no estoque`}
        </Text>
      </View>

      {/* Status chips */}
      <View className="flex-row gap-3 px-4 pb-5">
        <StatusChip label="Em dia" count={counts.safe} status="safe" />
        <StatusChip label="A vencer" count={counts.warning} status="warning" />
        <StatusChip label="Vencidos" count={counts.expired} status="expired" />
      </View>

      {/* Search */}
      <View className="mx-4 mb-3 flex-row items-center gap-2 rounded-xl border border-input bg-muted px-3 py-2.5">
        <Search size={16} color={theme.mutedForeground} />
        <TextInput
          className="flex-1 text-sm text-foreground"
          placeholder="Buscar produto..."
          placeholderTextColor={theme.mutedForeground}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          accessibilityLabel="Buscar produto"
        />
      </View>

      {/* Location filter chips — scrollable */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingBottom: 16 }}
      >
        {LOCATION_CHIPS.map(({ key, label, Icon }) => {
          const active = locationFilter === key;
          const iconColor = active ? theme.primaryForeground : theme.mutedForeground;
          return (
            <Pressable
              key={key}
              onPress={() => setLocationFilter(key)}
              accessibilityLabel={`Filtrar por ${label}`}
              className="flex-row items-center gap-1.5 rounded-full border px-3 py-1.5"
              style={{
                borderColor: active ? theme.primary : theme.border,
                backgroundColor: active ? theme.primary : 'transparent',
              }}
            >
              {Icon && <Icon size={12} color={iconColor} />}
              <Text
                className="text-xs font-medium"
                style={{ color: active ? theme.primaryForeground : theme.mutedForeground }}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background" edges={['top']}>
        <ActivityIndicator color={theme.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProductCard product={item} />}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <View className="items-center gap-4 px-8 py-20">
            <View className="items-center justify-center rounded-full bg-muted p-6">
              {search || locationFilter !== 'todos' ? (
                <SearchX size={48} color={theme.mutedForeground} />
              ) : (
                <ShoppingCart size={48} color={theme.mutedForeground} />
              )}
            </View>
            <View className="items-center gap-1">
              <Text variant="large">
                {search || locationFilter !== 'todos' ? 'Nenhum resultado' : 'Estoque vazio'}
              </Text>
              <Text variant="muted" className="text-center">
                {search || locationFilter !== 'todos'
                  ? 'Tente outro filtro ou busca'
                  : 'Adicione produtos para começar a\nmonitorar a validade'}
              </Text>
            </View>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        ItemSeparatorComponent={() => <View className="h-2" />}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        className="px-4"
      />

      {/* FAB */}
      <View className="absolute bottom-6 right-4">
        <Pressable
          onPress={() => router.push('/product/new')}
          accessibilityLabel="Adicionar produto"
          className="flex-row items-center gap-2 rounded-full bg-primary px-6 py-4 active:opacity-80"
          style={{ elevation: 4 }}
        >
          <Plus size={18} color={theme.primaryForeground} />
          <Text className="font-semibold text-primary-foreground">Adicionar</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
