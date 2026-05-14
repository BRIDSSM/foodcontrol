import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Link } from 'expo-router';
import { Eye, EyeOff, MailCheck, TriangleAlert } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Text } from '@/components/ui/text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { getTheme } from '@/lib/theme';

export default function RegisterScreen() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleSignUp() {
    setError(null);
    if (!fullName || !email || !password) {
      setError('Preencha todos os campos.');
      return;
    }
    if (password.length < 6) {
      setError('Senha deve ter mínimo 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    // Supabase retorna session=null quando confirmação de e-mail está ativa
    if (!data.session) {
      setAwaitingConfirmation(true);
    }
    // Se session != null, onAuthStateChange cuida do redirect automaticamente
  }

  if (awaitingConfirmation) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center gap-6 px-8">
          <View className="items-center justify-center rounded-full bg-primary/10 p-6">
            <MailCheck size={48} color={theme.primary} />
          </View>
          <View className="items-center gap-2">
            <Text variant="h2" className="text-center">
              Verifique seu e-mail
            </Text>
            <Text variant="muted" className="text-center">
              Enviamos um link de confirmação para{' '}
              <Text className="font-medium text-foreground">{email}</Text>. Acesse seu e-mail e
              clique no link para ativar sua conta.
            </Text>
          </View>
          <Link href="/(auth)/login" asChild>
            <Button variant="outline" className="w-full">
              <Text>Ir para o login</Text>
            </Button>
          </Link>
        </View>
      </SafeAreaView>
    );
  }

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

        {error && (
          <View className="flex-row items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3">
            <TriangleAlert size={16} color={theme.destructive} />
            <Text className="flex-1 text-sm text-destructive">{error}</Text>
          </View>
        )}

        <View className="gap-4">
          <FormField
            label="Nome completo"
            nativeID="reg-name"
            placeholder="Seu nome"
            autoComplete="name"
            autoCapitalize="words"
            value={fullName}
            onChangeText={setFullName}
          />
          <FormField
            label="E-mail"
            nativeID="reg-email"
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
          />
          <FormField
            label="Senha"
            nativeID="reg-password"
            placeholder="Mínimo 6 caracteres"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="new-password"
            value={password}
            onChangeText={setPassword}
            rightIcon={
              <Pressable
                onPress={() => setShowPassword((v) => !v)}
                accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? (
                  <EyeOff size={16} color={theme.mutedForeground} />
                ) : (
                  <Eye size={16} color={theme.mutedForeground} />
                )}
              </Pressable>
            }
          />
          <FormField
            label="Confirmar senha"
            nativeID="reg-confirm"
            placeholder="Repita a senha"
            secureTextEntry={!showConfirm}
            autoCapitalize="none"
            autoComplete="new-password"
            value={confirm}
            onChangeText={setConfirm}
            rightIcon={
              <Pressable
                onPress={() => setShowConfirm((v) => !v)}
                accessibilityLabel={showConfirm ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showConfirm ? (
                  <EyeOff size={16} color={theme.mutedForeground} />
                ) : (
                  <Eye size={16} color={theme.mutedForeground} />
                )}
              </Pressable>
            }
          />
        </View>

        <View className="gap-3">
          <Button
            className="w-full"
            accessibilityLabel="Criar conta"
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text>{loading ? 'Criando conta…' : 'Criar conta'}</Text>
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
