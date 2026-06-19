import { router, useLocalSearchParams } from 'expo-router';
import { CheckCircle, Eye, EyeOff, Lock, ShieldAlert, TriangleAlert } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/contexts/auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { translateAuthError } from '@/lib/auth-errors';
import { supabase } from '@/lib/supabase';
import { getTheme } from '@/lib/theme';

export default function ResetPasswordScreen() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const { code } = useLocalSearchParams<{ code: string }>();
  const { isPasswordRecovery } = useAuth();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exchanging, setExchanging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);
  const exchanged = useRef(false);

  useEffect(() => {
    if (exchanged.current) return;
    exchanged.current = true;

    if (!code) {
      setInvalidLink(true);
      return;
    }
    setExchanging(true);
    supabase.auth
      .exchangeCodeForSession(code)
      .then(({ error: err }) => {
        if (err) setInvalidLink(true);
      })
      .finally(() => setExchanging(false));
  }, [code]);

  async function handleReset() {
    setError(null);
    if (!password) {
      setError('Digite a nova senha.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(translateAuthError(updateError.message));
      setLoading(false);
      return;
    }
    await supabase.auth.signOut();
    setLoading(false);
    setDone(true);
  }

  if (invalidLink) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 justify-between">
            <View className="items-center gap-5 px-8 pb-10 pt-16">
              <View
                className="h-20 w-20 items-center justify-center rounded-3xl"
                style={{ backgroundColor: theme.destructive + '20' }}
              >
                <ShieldAlert size={36} color={theme.destructive} />
              </View>
              <View className="items-center gap-1">
                <Text className="text-3xl font-bold tracking-tight">Link inválido</Text>
                <Text variant="muted" className="text-center text-sm">
                  O link expirou ou já foi utilizado
                </Text>
              </View>
            </View>
            <View className="flex-1 gap-4 rounded-t-3xl border border-b-0 border-border bg-card px-6 pb-6 pt-8">
              <View className="flex-1 items-center justify-center gap-4 py-8">
                <Text variant="muted" className="text-center text-sm leading-relaxed">
                  Solicite um novo link de recuperação e tente novamente.
                </Text>
                <Button
                  className="mt-4 w-full"
                  onPress={() => router.replace('/(auth)/forgot-password')}
                >
                  <Text className="font-semibold">Solicitar novo link</Text>
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onPress={() => router.replace('/(auth)/login')}
                >
                  <Text>Voltar ao login</Text>
                </Button>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (done) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 justify-between">
            <View className="items-center gap-5 px-8 pb-10 pt-16">
              <View
                className="h-20 w-20 items-center justify-center rounded-3xl"
                style={{ backgroundColor: theme.primary }}
              >
                <CheckCircle size={36} color={theme.primaryForeground} />
              </View>
              <View className="items-center gap-1">
                <Text className="text-3xl font-bold tracking-tight">Senha redefinida</Text>
                <Text variant="muted" className="text-center text-sm">
                  Sua senha foi atualizada com sucesso
                </Text>
              </View>
            </View>
            <View className="flex-1 gap-4 rounded-t-3xl border border-b-0 border-border bg-card px-6 pb-6 pt-8">
              <View className="flex-1 items-center justify-center gap-4 py-8">
                <Text variant="muted" className="text-center text-sm leading-relaxed">
                  Faça login com sua nova senha para continuar.
                </Text>
                <Button className="mt-4 w-full" onPress={() => router.replace('/(auth)/login')}>
                  <Text className="font-semibold">Ir para o login</Text>
                </Button>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
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
            <View className="items-center gap-5 px-8 pb-10 pt-16">
              <View
                className="h-20 w-20 items-center justify-center rounded-3xl"
                style={{ backgroundColor: theme.primary }}
              >
                <Lock size={36} color={theme.primaryForeground} />
              </View>
              <View className="items-center gap-1">
                <Text className="text-3xl font-bold tracking-tight">Nova senha</Text>
                <Text variant="muted" className="text-center text-sm">
                  Escolha uma senha segura para sua conta
                </Text>
              </View>
            </View>

            <View className="flex-1 gap-6 rounded-t-3xl border border-b-0 border-border bg-card px-6 pb-6 pt-8">
              <View className="gap-1">
                <Text variant="h3">Redefinir senha</Text>
                <Text variant="muted" className="text-sm">
                  Mínimo de 6 caracteres
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
                  label="Nova senha"
                  nativeID="reset-new-password"
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
                  label="Confirmar nova senha"
                  nativeID="reset-confirm-password"
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
                      accessibilityLabel={
                        showConfirm ? 'Ocultar confirmação' : 'Mostrar confirmação'
                      }
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
                  accessibilityLabel="Salvar nova senha"
                  onPress={handleReset}
                  disabled={loading || exchanging || !isPasswordRecovery}
                >
                  <Text className="font-semibold">
                    {exchanging ? 'Verificando link…' : loading ? 'Salvando…' : 'Salvar nova senha'}
                  </Text>
                </Button>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
