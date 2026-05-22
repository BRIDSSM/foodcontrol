import '@/global.css';

import { PortalHost } from '@rn-primitives/portal';
import { ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

import { AuthProvider, useAuth } from '@/contexts/auth';
import { ONBOARDING_KEY } from '@/app/onboarding';
import {
  requestNotificationPermissions,
  setupNotificationChannel,
} from '@/features/notifications/permissions';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { NAV_THEME } from '@/lib/theme';

const isExpoGo = Constants.appOwnership === 'expo';

if (!isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

const queryClient = new QueryClient();

function AuthGuard() {
  const { isSignedIn, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    setMounted(true);
    if (isExpoGo) {
      setHasSeenOnboarding(true);
      return;
    }
    SecureStore.getItemAsync(ONBOARDING_KEY).then((val) => {
      setHasSeenOnboarding(val === 'true');
    });
  }, []);

  useEffect(() => {
    if (!mounted || isLoading || hasSeenOnboarding === null) return;

    if (!hasSeenOnboarding && segments[0] !== 'onboarding') {
      router.replace('/onboarding');
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    if (!isSignedIn && !inAuthGroup && segments[0] !== 'onboarding') {
      router.replace('/(auth)/login');
    } else if (isSignedIn && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isSignedIn, isLoading, segments, mounted, hasSeenOnboarding]);

  useEffect(() => {
    if (!isSignedIn || isExpoGo) return;
    setupNotificationChannel()
      .then(() => requestNotificationPermissions())
      .catch(() => {});
  }, [isSignedIn]);

  return null;
}

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider value={NAV_THEME[colorScheme]}>
          <AuthGuard />
          <Stack>
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="product" options={{ headerShown: false }} />
            <Stack.Screen name="profile" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <PortalHost />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
