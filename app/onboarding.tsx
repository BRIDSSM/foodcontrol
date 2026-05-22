import Constants from 'expo-constants';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import LottieView from 'lottie-react-native';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

const isExpoGo = Constants.appOwnership === 'expo';

export const ONBOARDING_KEY = 'onboarding_complete';

export default function OnboardingScreen() {
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
          <View className="flex-row items-start gap-3">
            <Text className="text-lg">📦</Text>
            <Text variant="muted" className="flex-1 text-sm">
              Cadastre produtos manualmente ou via código de barras
            </Text>
          </View>
          <View className="flex-row items-start gap-3">
            <Text className="text-lg">🔔</Text>
            <Text variant="muted" className="flex-1 text-sm">
              Receba alertas antes dos produtos vencerem
            </Text>
          </View>
          <View className="flex-row items-start gap-3">
            <Text className="text-lg">📊</Text>
            <Text variant="muted" className="flex-1 text-sm">
              Acompanhe seu aproveitamento e reduza o descarte
            </Text>
          </View>
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
