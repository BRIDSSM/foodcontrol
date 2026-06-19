import { router, useLocalSearchParams } from 'expo-router';
import { CheckCircle, ShieldAlert } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { getTheme } from '@/lib/theme';

export default function ConfirmEmailScreen() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const { code } = useLocalSearchParams<{ code: string }>();

  const [invalidLink, setInvalidLink] = useState(false);
  const exchanged = useRef(false);

  useEffect(() => {
    if (exchanged.current) return;
    exchanged.current = true;

    if (!code) {
      setInvalidLink(true);
      return;
    }
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) setInvalidLink(true);
      // sucesso: onAuthStateChange dispara SIGNED_IN → AuthGuard redireciona para /(tabs)
    });
  }, [code]);

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
                  Crie uma nova conta ou solicite o reenvio do e-mail de confirmação.
                </Text>
                <Button className="mt-4 w-full" onPress={() => router.replace('/(auth)/register')}>
                  <Text className="font-semibold">Voltar ao cadastro</Text>
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onPress={() => router.replace('/(auth)/login')}
                >
                  <Text>Ir para o login</Text>
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
      <View className="flex-1 items-center justify-center gap-6 px-8">
        <View
          className="h-20 w-20 items-center justify-center rounded-3xl"
          style={{ backgroundColor: theme.primary }}
        >
          <CheckCircle size={36} color={theme.primaryForeground} />
        </View>
        <View className="items-center gap-2">
          <Text className="text-2xl font-bold tracking-tight">Confirmando conta…</Text>
          <Text variant="muted" className="text-center text-sm">
            Aguarde um momento
          </Text>
        </View>
        <ActivityIndicator color={theme.primary} size="large" />
      </View>
    </SafeAreaView>
  );
}
