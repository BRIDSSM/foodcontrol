import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Text } from '@/components/ui/text';

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ gap: 20, padding: 16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* TODO: buscar produto por id (useProduct(id)) e pré-preencher os campos */}
        {/* Mesma estrutura do AddProductScreen — extrair <ProductForm /> quando implementar */}

        <View className="gap-4">
          <FormField label="Nome *" nativeID="edit-name" placeholder="Ex: Leite integral 1L" />
          <FormField label="Código de barras" nativeID="edit-barcode" editable={false} />

          {/* TODO: <Select> com product_category enum */}
          <FormField
            label="Categoria *"
            nativeID="edit-category"
            placeholder="Selecione a categoria"
            editable={false}
          />

          <FormField
            label="Quantidade *"
            nativeID="edit-quantity"
            placeholder="1"
            keyboardType="numeric"
          />

          {/* TODO: Segmented control — Despensa | Geladeira | Congelador */}
          <View className="gap-2">
            <Text className="text-sm font-medium text-foreground">Local de armazenamento *</Text>
          </View>

          {/* TODO: date picker */}
          <View className="gap-2">
            <Text className="text-sm font-medium text-foreground">Data de validade *</Text>
          </View>
        </View>

        {/* IMPORTANTE: NÃO registrar em product_removals — só remoção via RemoveProductSheet faz isso */}
        {/* TODO: handleSubmit (Zod schema compartilhado) → supabase.update(products, { id }) → router.back() */}
        <Button className="w-full" accessibilityLabel="Salvar alterações" onPress={() => {}}>
          <Text>Salvar alterações</Text>
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
