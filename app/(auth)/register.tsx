import { Link, router } from 'expo-router';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MailCheck,
  TriangleAlert,
  User,
  UserPlus,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
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
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-between">
            <View className="items-center gap-5 px-8 pb-10 pt-16">
              <View
                className="h-20 w-20 items-center justify-center rounded-3xl"
                style={{ backgroundColor: theme.primary }}
              >
                <MailCheck size={36} color={theme.primaryForeground} />
              </View>
              <View className="items-center gap-1">
                <Text className="text-3xl font-bold tracking-tight">Verifique seu e-mail</Text>
                <Text variant="muted" className="text-center text-sm">
                  Acesse o link enviado para ativar sua conta
                </Text>
              </View>
            </View>

            <View className="flex-1 gap-6 rounded-t-3xl border border-b-0 border-border bg-card px-6 pb-6 pt-8">
              <View className="flex-1 items-center justify-center gap-4 py-4">
                <Text variant="muted" className="text-center text-sm leading-relaxed">
                  Enviamos um link de confirmação para{'\n'}
                  <Text className="font-semibold text-foreground">{email}</Text>
                  {'\n\n'}Clique no link para ativar sua conta e depois faça login.
                </Text>
              </View>
              <View className="gap-4">
                <Link href="/(auth)/login" asChild>
                  <Button className="w-full" accessibilityLabel="Ir para o login">
                    <Text className="font-semibold">Ir para o login</Text>
                  </Button>
                </Link>
                <Pressable
                  onPress={() => setAwaitingConfirmation(false)}
                  accessibilityLabel="Voltar ao cadastro"
                  className="flex-row items-center justify-center gap-2 py-2"
                >
                  <ArrowLeft size={16} color={theme.mutedForeground} />
                  <Text variant="muted" className="text-sm">
                    Voltar ao cadastro
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
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
              <UserPlus size={36} color={theme.primaryForeground} />
            </View>
            <View className="items-center gap-1">
              <Text className="text-3xl font-bold tracking-tight">Criar conta</Text>
              <Text variant="muted" className="text-center text-sm">
                Comece a controlar a validade dos seus alimentos
              </Text>
            </View>
          </View>

          {/* Form */}
          <View className="flex-1 gap-6 rounded-t-3xl border border-b-0 border-border bg-card px-6 pb-6 pt-8">
            <View className="gap-1">
              <Text variant="h3">Suas informações</Text>
              <Text variant="muted" className="text-sm">
                Preencha os dados para criar sua conta
              </Text>
            </View>

            {error && (
              <View className="flex-row items-center gap-3 rounded-xl bg-destructive/10 px-4 py-3">
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
                leftIcon={<User size={16} color={theme.mutedForeground} />}
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
                leftIcon={<Mail size={16} color={theme.mutedForeground} />}
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
                leftIcon={<Lock size={16} color={theme.mutedForeground} />}
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
                leftIcon={<Lock size={16} color={theme.mutedForeground} />}
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

            <View className="gap-4 pt-2">
              <Button
                className="w-full"
                accessibilityLabel="Criar conta"
                onPress={handleSignUp}
                disabled={loading}
              >
                <Text className="font-semibold">{loading ? 'Criando conta…' : 'Criar conta'}</Text>
              </Button>

              <View className="flex-row items-center justify-center gap-1">
                <Text variant="muted" className="text-sm">
                  Já tem conta?
                </Text>
                <Link href="/(auth)/login" asChild>
                  <Button variant="link" className="px-1">
                    <Text className="text-sm font-semibold text-primary">Entrar</Text>
                  </Button>
                </Link>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
