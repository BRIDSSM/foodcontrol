import { router } from 'expo-router';
import { ArrowLeft, CheckCircle, KeyRound, Mail, TriangleAlert } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Text } from '@/components/ui/text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { getTheme } from '@/lib/theme';

export default function ForgotPasswordScreen() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleReset() {
    setError(null);
    if (!email.trim()) {
      setError('Informe seu e-mail.');
      return;
    }
    setLoading(true);
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email.trim());
    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    setSent(true);
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-between">
          {/* Brand */}
          <View className="items-center gap-5 px-8 pb-10 pt-16">
            <View
              className="h-20 w-20 items-center justify-center rounded-3xl"
              style={{ backgroundColor: theme.primary }}
            >
              <KeyRound size={36} color={theme.primaryForeground} />
            </View>
            <View className="items-center gap-1">
              <Text className="text-3xl font-bold tracking-tight">Recuperar senha</Text>
              <Text variant="muted" className="text-center text-sm">
                Enviaremos um link para redefinir sua senha
              </Text>
            </View>
          </View>

          {/* Form */}
          <View className="flex-1 gap-6 rounded-t-3xl border border-b-0 border-border bg-card px-6 pb-6 pt-8">
            {sent ? (
              <View className="flex-1 items-center justify-center gap-4 py-8">
                <View
                  className="h-16 w-16 items-center justify-center rounded-full"
                  style={{ backgroundColor: theme.primary + '20' }}
                >
                  <CheckCircle size={32} color={theme.primary} />
                </View>
                <View className="items-center gap-2">
                  <Text variant="h3">E-mail enviado</Text>
                  <Text variant="muted" className="text-center text-sm">
                    Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
                  </Text>
                </View>
                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  onPress={() => router.replace('/(auth)/login')}
                >
                  <Text>Voltar ao login</Text>
                </Button>
              </View>
            ) : (
              <>
                <View className="gap-1">
                  <Text variant="h3">Informe seu e-mail</Text>
                  <Text variant="muted" className="text-sm">
                    Você receberá um link para criar uma nova senha
                  </Text>
                </View>

                {error && (
                  <View className="flex-row items-center gap-3 rounded-xl bg-destructive/10 px-4 py-3">
                    <TriangleAlert size={16} color={theme.destructive} />
                    <Text className="flex-1 text-sm text-destructive">{error}</Text>
                  </View>
                )}

                <FormField
                  label="E-mail"
                  nativeID="reset-email"
                  placeholder="seu@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  value={email}
                  onChangeText={setEmail}
                  leftIcon={<Mail size={16} color={theme.mutedForeground} />}
                />

                <View className="gap-4 pt-2">
                  <Button
                    className="w-full"
                    accessibilityLabel="Enviar link de recuperação"
                    onPress={handleReset}
                    disabled={loading}
                  >
                    <Text className="font-semibold">{loading ? 'Enviando…' : 'Enviar link'}</Text>
                  </Button>

                  <Pressable
                    onPress={() => router.back()}
                    accessibilityLabel="Voltar ao login"
                    className="flex-row items-center justify-center gap-2 py-2"
                  >
                    <ArrowLeft size={16} color={theme.mutedForeground} />
                    <Text variant="muted" className="text-sm">
                      Voltar ao login
                    </Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
