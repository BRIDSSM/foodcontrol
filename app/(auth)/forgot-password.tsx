import { ScrollView, View } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Text } from '@/components/ui/text';

export default function ForgotPasswordScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24, gap: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-2">
          <Text variant="h2">Recuperar senha</Text>
          <Text variant="muted">
            Informe seu e-mail e enviaremos um link para redefinir sua senha.
          </Text>
        </View>

        <FormField
          label="E-mail"
          nativeID="reset-email"
          placeholder="seu@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <View className="gap-3">
          {/* TODO: supabase.auth.resetPasswordForEmail → toast "Verifique seu e-mail" */}
          <Button
            className="w-full"
            accessibilityLabel="Enviar link de recuperação"
            onPress={() => {}}
          >
            <Text>Enviar link</Text>
          </Button>

          <Link href="/(auth)/login" asChild>
            <Button variant="ghost" className="w-full">
              <Text>Voltar ao login</Text>
            </Button>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
