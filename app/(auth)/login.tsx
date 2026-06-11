import { Link } from 'expo-router';
import { Eye, EyeOff, Leaf, Lock, Mail, TriangleAlert } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Text } from '@/components/ui/text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { getTheme } from '@/lib/theme';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const [email, setEmail] = useState(__DEV__ ? (process.env.EXPO_PUBLIC_DEV_EMAIL ?? '') : '');
  const [password, setPassword] = useState(
    __DEV__ ? (process.env.EXPO_PUBLIC_DEV_PASSWORD ?? '') : '',
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSignIn() {
    setError(null);
    if (!email || !password) {
      setError('Preencha e-mail e senha.');
      return;
    }
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) setError(authError.message);
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
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
                <Leaf size={36} color={theme.primaryForeground} />
              </View>
              <View className="items-center gap-1">
                <Text className="text-3xl font-bold tracking-tight">FoodControl</Text>
                <Text variant="muted" className="text-center text-sm">
                  Menos desperdício, mais aproveitamento
                </Text>
              </View>
            </View>

            {/* Form */}
            <View className="flex-1 gap-6 rounded-t-3xl border border-b-0 border-border bg-card px-6 pb-6 pt-8">
              <View className="gap-1">
                <Text variant="h3">Bem-vindo de volta</Text>
                <Text variant="muted" className="text-sm">
                  Entre com sua conta para continuar
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
                  label="E-mail"
                  nativeID="login-email"
                  placeholder="seu@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  value={email}
                  onChangeText={setEmail}
                  leftIcon={<Mail size={16} color={theme.mutedForeground} />}
                />
                <View className="gap-1">
                  <FormField
                    label="Senha"
                    nativeID="login-password"
                    placeholder="Mínimo 6 caracteres"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="current-password"
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
                  <Link href="/(auth)/forgot-password" asChild>
                    <Button variant="ghost" className="self-end px-0">
                      <Text className="text-sm text-primary">Esqueci minha senha</Text>
                    </Button>
                  </Link>
                </View>
              </View>

              <View className="gap-4 pt-2">
                <Button
                  className="w-full"
                  accessibilityLabel="Entrar"
                  onPress={handleSignIn}
                  disabled={loading}
                >
                  <Text className="font-semibold">{loading ? 'Entrando…' : 'Entrar'}</Text>
                </Button>

                <View className="flex-row items-center justify-center gap-1">
                  <Text variant="muted" className="text-sm">
                    Não tem conta?
                  </Text>
                  <Link href="/(auth)/register" asChild>
                    <Button variant="link" className="px-1">
                      <Text className="text-sm font-semibold text-primary">Criar conta</Text>
                    </Button>
                  </Link>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
