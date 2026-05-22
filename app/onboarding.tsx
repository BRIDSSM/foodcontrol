import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { BarChart3, Bell, PackageSearch } from 'lucide-react-native';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getTheme } from '@/lib/theme';
import OnboardingIllustration from '@/assets/illustrations/onboarding.svg';

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
      <View className="flex-1 justify-between">
        {/* Ilustração + brand */}
        <View className="flex-1 items-center justify-center gap-5 px-8 pb-8 pt-12">
          <OnboardingIllustration width={240} height={240} />
          <View className="items-center gap-1">
            <Text className="text-center text-3xl font-bold tracking-tight">FoodControl</Text>
            <Text variant="muted" className="text-center text-sm">
              Menos desperdício, mais aproveitamento
            </Text>
          </View>
        </View>

        {/* Card com features + CTA */}
        <View className="gap-6 rounded-t-3xl border border-b-0 border-border bg-card px-6 pb-6 pt-8">
          <View className="gap-4">
            {FEATURES.map(({ Icon, label }) => (
              <View key={label} className="flex-row items-center gap-4">
                <View
                  className="h-10 w-10 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: theme.primary }}
                >
                  <Icon size={20} color={theme.primaryForeground} />
                </View>
                <Text className="flex-1 text-sm leading-relaxed text-foreground">{label}</Text>
              </View>
            ))}
          </View>

          <Button className="w-full" onPress={handleStart} accessibilityLabel="Começar">
            <Text className="font-semibold">Começar</Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
