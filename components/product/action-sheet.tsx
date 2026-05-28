import { router } from 'expo-router';
import { CheckCircle2, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Platform, Pressable, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useRemoveProduct } from '@/features/inventory/mutations';
import type { Product } from '@/features/inventory/queries';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getTheme, STATUS_COLORS } from '@/lib/theme';

export type ActionSheetProps = {
  product: Product;
  destination: 'consumido' | 'descartado';
  visible: boolean;
  onClose: () => void;
};

export function ActionSheet({ product, destination, visible, onClose }: ActionSheetProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = getTheme(colorScheme);
  const palette = STATUS_COLORS[colorScheme];
  const { mutate: removeProduct, isPending } = useRemoveProduct();

  const [quantityText, setQuantityText] = useState(String(product.quantity));

  const qty = parseFloat(quantityText.replace(',', '.'));
  const exceedsStock = !isNaN(qty) && qty > product.quantity;
  const valid = !isNaN(qty) && qty > 0 && !exceedsStock;

  const isConsume = destination === 'consumido';
  const accentColor = isConsume ? palette.safe : palette.expired;
  const Icon = isConsume ? CheckCircle2 : Trash2;
  const title = isConsume ? 'Consumir produto' : 'Descartar produto';
  const confirmLabel = isConsume ? 'Registrar consumo' : 'Registrar descarte';

  function handleConfirm() {
    if (!valid) return;
    removeProduct(
      { product, quantity_removed: qty, destination },
      {
        onSuccess: () => {
          onClose();
          if (qty >= product.quantity) router.back();
        },
      },
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/50" onPress={onClose}>
        <Pressable onPress={() => {}}>
          <View style={{ backgroundColor: theme.card }} className="rounded-t-2xl px-5 pb-10 pt-4">
            {/* Handle */}
            <View className="mb-5 items-center">
              <View className="h-1 w-10 rounded-full bg-muted-foreground/30" />
            </View>

            {/* Título com ícone */}
            <View className="mb-1 flex-row items-center gap-2">
              <Icon size={20} color={accentColor} />
              <Text className="text-lg font-bold">{title}</Text>
            </View>
            <Text className="mb-6 text-sm text-muted-foreground" numberOfLines={1}>
              {product.name}
            </Text>

            {/* Quantidade */}
            <View className="mb-1.5 flex-row items-center justify-between">
              <Text className="text-sm font-medium">Quantidade</Text>
              <Text className="text-xs text-muted-foreground">
                Disponível:{' '}
                {product.quantity % 1 === 0 ? product.quantity : product.quantity.toFixed(2)}
              </Text>
            </View>
            <TextInput
              value={quantityText}
              onChangeText={setQuantityText}
              keyboardType="decimal-pad"
              autoFocus
              style={{
                borderWidth: 1,
                borderColor: exceedsStock ? palette.expired : theme.border,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: Platform.OS === 'ios' ? 10 : 8,
                fontSize: 16,
                color: theme.foreground,
                backgroundColor: theme.background,
              }}
            />
            {exceedsStock ? (
              <Text className="mb-6 mt-1.5 text-xs" style={{ color: palette.expired }}>
                Quantidade maior do que o estoque disponível
              </Text>
            ) : (
              <View className="mb-6" />
            )}

            <Button
              className="w-full"
              accessibilityLabel={confirmLabel}
              disabled={!valid || isPending}
              onPress={handleConfirm}
              variant={isConsume ? 'default' : 'destructive'}
            >
              <Text>{isPending ? 'Salvando…' : confirmLabel}</Text>
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
