import { router, useFocusEffect } from 'expo-router';
import {
  Archive,
  Plus,
  Refrigerator,
  Search,
  SearchX,
  ShoppingCart,
  SlidersHorizontal,
  Snowflake,
} from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductCard } from '@/components/product/product-card';
import { StatusChip } from '@/components/product/status-chip';
import { Text } from '@/components/ui/text';
import { CATEGORY_LABELS } from '@/constants/labels';
import { useAuth } from '@/contexts/auth';
import { useProducts } from '@/features/inventory/queries';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getStatus, type ProductStatus } from '@/lib/status';
import { getTheme } from '@/lib/theme';
import { getFirstName } from '@/lib/utils';
import { CATEGORIES } from '@/schemas/product';
import type { Enums } from '@/types/database';

type LocationFilter = Enums<'storage_location'> | 'todos';
type CategoryFilter = Enums<'product_category'> | 'todas';

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

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = getTheme(colorScheme);
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState<LocationFilter>('todos');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('todas');
  const [showFilterModal, setShowFilterModal] = useState(false);

  const { data: products = [], isLoading, refetch } = useProducts();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesLocation = locationFilter === 'todos' || p.storage_location === locationFilter;
      const matchesCategory = categoryFilter === 'todas' || p.category === categoryFilter;
      const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      return matchesLocation && matchesCategory && matchesSearch;
    });
  }, [products, locationFilter, categoryFilter, search]);

  const counts = useMemo(() => {
    const result: Record<ProductStatus, number> = { safe: 0, warning: 0, expired: 0 };
    for (const p of products) result[getStatus(p.expiration_date)]++;
    return result;
  }, [products]);

  const hasActiveFilter = locationFilter !== 'todos' || categoryFilter !== 'todas';
  const firstName = getFirstName(user);

  const ListHeader = (
    <View>
      {/* Header */}
      <View className="px-4 pb-3 pt-4">
        <Text className="text-2xl font-bold">{firstName ? `Olá, ${firstName}!` : 'Olá!'}</Text>
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

      {/* Search + filter icon */}
      <View className="mx-4 mb-3 flex-row items-center gap-2 rounded-xl border border-input bg-muted px-3 py-1.5">
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
        <Pressable
          onPress={() => setShowFilterModal(true)}
          accessibilityLabel="Abrir filtros"
          hitSlop={8}
        >
          <SlidersHorizontal
            size={16}
            color={hasActiveFilter ? theme.primary : theme.mutedForeground}
          />
          {hasActiveFilter && (
            <View
              style={{
                position: 'absolute',
                top: -3,
                right: -3,
                width: 7,
                height: 7,
                borderRadius: 4,
                backgroundColor: theme.primary,
              }}
            />
          )}
        </Pressable>
      </View>

      {/* Location filter chips */}
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

      {/* Unified filter modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <Pressable className="flex-1 bg-black/50" onPress={() => setShowFilterModal(false)}>
          <View className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-card pb-8">
            <View className="items-center py-3">
              <View className="h-1 w-10 rounded-full bg-muted-foreground/30" />
            </View>

            <View className="flex-row items-center justify-between px-4 pb-4">
              <Text className="text-base font-semibold">Filtros</Text>
              {hasActiveFilter && (
                <TouchableOpacity
                  onPress={() => {
                    setLocationFilter('todos');
                    setCategoryFilter('todas');
                    setShowFilterModal(false);
                  }}
                  accessibilityLabel="Limpar filtros"
                >
                  <Text className="text-sm text-primary">Limpar</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Local section */}
            <Text className="px-4 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Local
            </Text>
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
                    accessibilityLabel={label}
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

            {/* Category section */}
            <Text className="px-4 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Categoria
            </Text>
            <ScrollView style={{ maxHeight: 260 }} showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                onPress={() => setCategoryFilter('todas')}
                className="flex-row items-center justify-between px-4 py-3"
                accessibilityLabel="Todas as categorias"
              >
                <Text className={categoryFilter === 'todas' ? 'font-semibold text-primary' : ''}>
                  Todas as categorias
                </Text>
                {categoryFilter === 'todas' && <View className="h-2 w-2 rounded-full bg-primary" />}
              </TouchableOpacity>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategoryFilter(cat)}
                  className="flex-row items-center justify-between px-4 py-3"
                  accessibilityLabel={CATEGORY_LABELS[cat]}
                >
                  <Text className={cat === categoryFilter ? 'font-semibold text-primary' : ''}>
                    {CATEGORY_LABELS[cat]}
                  </Text>
                  {cat === categoryFilter && <View className="h-2 w-2 rounded-full bg-primary" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
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
        renderItem={({ item }) => (
          <View className="px-4">
            <ProductCard product={item} />
          </View>
        )}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <View className="items-center gap-4 px-8 py-20">
            <View className="items-center justify-center rounded-full bg-muted p-6">
              {search || hasActiveFilter ? (
                <SearchX size={48} color={theme.mutedForeground} />
              ) : (
                <ShoppingCart size={48} color={theme.mutedForeground} />
              )}
            </View>
            <View className="items-center gap-1">
              <Text variant="large">
                {search || hasActiveFilter ? 'Nenhum resultado' : 'Estoque vazio'}
              </Text>
              <Text variant="muted" className="text-center">
                {search || hasActiveFilter
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
