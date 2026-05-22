import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { BarChart3, Bell, PackageSearch } from 'lucide-react-native';
import LottieView from 'lottie-react-native';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { isExpoGo } from '@/lib/platform';
import { getTheme } from '@/lib/theme';

export const ONBOARDING_KEY = 'onboarding_complete';

const FEATURES = [
  {
    Icon: PackageSearch,
    label: 'Cadastre produtos manualmente ou via código de barras',
  },
  {
    Icon: Bell,
    label: 'Receba alertas antes dos produtos vencerem',
  },
  {
    Icon: BarChart3,
    label: 'Acompanhe seu aproveitamento e reduza o descarte',
  },
] as const;

export default function OnboardingScreen() {
  const theme = getTheme(useColorScheme() ?? 'light');

  async function handleStart() {
    await SecureStore.setItemAsync(ONBOARDING_KEY, 'true');
    router.replace('/(auth)/login');
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="flex-1 items-center justify-center gap-6 px-8">
        {!isExpoGo && (
          <LottieView
            source={require('@/assets/animations/onboarding.json')}
            autoPlay
            loop
            style={{ width: 280, height: 280 }}
          />
        )}

        <View className="items-center gap-2">
          <Text className="text-center text-3xl font-bold">FoodControl</Text>
          <Text variant="muted" className="text-center text-base leading-relaxed">
            Controle a validade dos seus alimentos e reduza o desperdício em casa.
          </Text>
        </View>

        <View className="w-full gap-3 pt-4">
          {FEATURES.map(({ Icon, label }) => (
            <View key={label} className="flex-row items-center gap-3">
              <View className="items-center justify-center rounded-full bg-primary/10 p-2">
                <Icon size={18} color={theme.primary} />
              </View>
              <Text variant="muted" className="flex-1 text-sm">
                {label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className="px-8 pb-4">
        <Button className="w-full" onPress={handleStart} accessibilityLabel="Começar">
          <Text>Começar</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
