import { ScrollView, View } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Text } from '@/components/ui/text';

export default function RegisterScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24, gap: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-1 pt-4">
          <Text variant="h2">Criar conta</Text>
          <Text variant="muted">Comece a controlar a validade dos seus alimentos</Text>
        </View>

        <View className="gap-4">
          <FormField
            label="Nome completo"
            nativeID="reg-name"
            placeholder="Seu nome"
            autoComplete="name"
            autoCapitalize="words"
          />
          <FormField
            label="E-mail"
            nativeID="reg-email"
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <FormField
            label="Senha"
            nativeID="reg-password"
            placeholder="Mínimo 6 caracteres"
            secureTextEntry
            autoComplete="new-password"
          />
          <FormField
            label="Confirmar senha"
            nativeID="reg-confirm"
            placeholder="Repita a senha"
            secureTextEntry
            autoComplete="new-password"
          />
        </View>

        <View className="gap-3">
          {/* TODO: handleSubmit (Zod) → supabase.auth.signUp → tela "Verifique seu e-mail" */}
          <Button className="w-full" accessibilityLabel="Criar conta" onPress={() => {}}>
            <Text>Criar conta</Text>
          </Button>

          <View className="flex-row items-center justify-center gap-1">
            <Text variant="muted">Já tem conta?</Text>
            <Link href="/(auth)/login" asChild>
              <Button variant="link" className="px-1">
                <Text>Entrar</Text>
              </Button>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
