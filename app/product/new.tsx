import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { router } from 'expo-router';

import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Text } from '@/components/ui/text';

export default function AddProductScreen() {
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
        {/* Atalho scanner — navega para /product/scan, retorna com barcode + dados pré-preenchidos */}
        <Button
          variant="outline"
          className="w-full"
          accessibilityLabel="Escanear código de barras"
          onPress={() => router.push('/product/scan')}
        >
          <Text>📷 Escanear código de barras</Text>
        </Button>

        {/* TODO: image picker — galeria/câmera → upload para product-images/{user_id}/{uuid}.jpg */}

        <View className="gap-4">
          {/* TODO: auto-preenchido quando vier do scanner */}
          <FormField label="Nome *" nativeID="prod-name" placeholder="Ex: Leite integral 1L" />
          <FormField
            label="Código de barras"
            nativeID="prod-barcode"
            placeholder="Preenchido automaticamente após scan"
            editable={false}
          />

          {/* TODO: <Select> react-native-reusables com product_category enum */}
          <FormField
            label="Categoria *"
            nativeID="prod-category"
            placeholder="Selecione a categoria"
            editable={false}
          />

          <FormField
            label="Quantidade *"
            nativeID="prod-quantity"
            placeholder="1"
            keyboardType="numeric"
          />

          {/* TODO: Segmented control — Despensa | Geladeira | Congelador (storage_location enum) */}
          <View className="gap-2">
            <Text className="text-sm font-medium text-foreground">Local de armazenamento *</Text>
          </View>

          {/* TODO: date picker — avisar (não bloquear) datas passadas */}
          <View className="gap-2">
            <Text className="text-sm font-medium text-foreground">Data de validade *</Text>
          </View>
        </View>

        {/* TODO: handleSubmit (Zod schema) → supabase.insert(products) → scheduleProductNotifications → router.back() */}
        <Button className="w-full" accessibilityLabel="Salvar produto" onPress={() => {}}>
          <Text>Salvar produto</Text>
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
