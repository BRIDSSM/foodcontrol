import '@/global.css';

import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { LogBox, View } from 'react-native';
import 'react-native-reanimated';

import * as SecureStore from 'expo-secure-store';

import { ONBOARDING_KEY } from '@/app/onboarding';
import { AuthProvider, useAuth } from '@/contexts/auth';
import {
  requestNotificationPermissions,
  setupNotificationChannel,
} from '@/features/notifications/permissions';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getTheme, NAV_THEME } from '@/lib/theme';

LogBox.ignoreLogs(['Unable to activate keep awake']);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const queryClient = new QueryClient();

function AuthGuard() {
  const { isSignedIn, isLoading, isPasswordRecovery } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    SecureStore.getItemAsync(ONBOARDING_KEY).then((val) => {
      setHasSeenOnboarding(val === 'true');
    });
  }, [segments]);

  useEffect(() => {
    if (!mounted || isLoading || hasSeenOnboarding === null) return;

    if (!hasSeenOnboarding && segments[0] !== 'onboarding' && segments[0] !== '(auth)') {
      router.replace('/onboarding');
      return;
    }

    if (isPasswordRecovery) {
      if (segments[0] !== '(auth)' || segments[1] !== 'reset-password') {
        router.replace('/(auth)/reset-password');
      }
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    if (!isSignedIn && !inAuthGroup && segments[0] !== 'onboarding') {
      router.replace('/(auth)/login');
    } else if (isSignedIn && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isSignedIn, isLoading, segments, mounted, hasSeenOnboarding, isPasswordRecovery]);

  useEffect(() => {
    if (!isSignedIn) return;
    setupNotificationChannel()
      .then(() => requestNotificationPermissions())
      .catch(() => {});
  }, [isSignedIn]);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const productId = response.notification.request.content.data?.productId as string | undefined;
      if (productId) router.push(`/product/${productId}`);
    });
    return () => sub.remove();
  }, []);

  return null;
}

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = getTheme(colorScheme);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider value={NAV_THEME[colorScheme]}>
          <AuthGuard />
          <View style={{ flex: 1, backgroundColor: theme.background }}>
            <Stack
              screenOptions={{
                animation: 'fade',
                contentStyle: { backgroundColor: theme.background },
              }}
            >
              <Stack.Screen name="onboarding" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="product" options={{ headerShown: false }} />
              <Stack.Screen name="profile" options={{ headerShown: false }} />
            </Stack>
          </View>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <PortalHost />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
