import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Link } from 'expo-router';
import { Eye, EyeOff, Lock, Mail, TriangleAlert } from 'lucide-react-native';
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
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
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

        <View className="flex-1 gap-6 p-6">
          <Text variant="h3">Entrar na conta</Text>

          {error && (
            <View className="flex-row items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3">
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
                <Button variant="ghost" className="self-end">
                  <Text className="text-sm">Esqueci minha senha</Text>
                </Button>
              </Link>
            </View>
          </View>

          <View className="gap-3">
            <Button
              className="w-full"
              accessibilityLabel="Entrar"
              onPress={handleSignIn}
              disabled={loading}
            >
              <Text>{loading ? 'Entrando…' : 'Entrar'}</Text>
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
