import { ScrollView, View } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Text } from '@/components/ui/text';

export default function LoginScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero da marca — rola para cima quando o teclado abre */}
        <View className="items-center justify-center gap-4 bg-primary px-6 py-16">
          <View className="h-16 w-16 items-center justify-center rounded-2xl bg-primary-foreground/20">
            <Text className="text-4xl">🌿</Text>
          </View>
          <View className="items-center gap-1">
            <Text className="text-3xl font-bold text-primary-foreground">FoodControl</Text>
            <Text className="text-sm text-primary-foreground/70">
              Menos desperdício, mais aproveitamento
            </Text>
          </View>
        </View>

        {/* Formulário */}
        <View className="flex-1 gap-6 p-6">
          <Text variant="h3">Entrar na conta</Text>

          <View className="gap-4">
            <FormField
              label="E-mail"
              nativeID="login-email"
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <View className="gap-1">
              <FormField
                label="Senha"
                nativeID="login-password"
                placeholder="Mínimo 6 caracteres"
                secureTextEntry
                autoComplete="current-password"
              />
              <Link href="/(auth)/forgot-password" asChild>
                <Button variant="ghost" className="self-end">
                  <Text className="text-sm">Esqueci minha senha</Text>
                </Button>
              </Link>
            </View>
          </View>

          <View className="gap-3">
            {/* TODO: handleSubmit (Zod) → supabase.auth.signInWithPassword → router.replace('/(tabs)') */}
            <Button className="w-full" accessibilityLabel="Entrar" onPress={() => {}}>
              <Text>Entrar</Text>
            </Button>

            <View className="flex-row items-center justify-center gap-1">
              <Text variant="muted">Não tem conta?</Text>
              <Link href="/(auth)/register" asChild>
                <Button variant="link" className="px-1">
                  <Text>Criar conta</Text>
                </Button>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
