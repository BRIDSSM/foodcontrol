import '@/global.css';

import { PortalHost } from '@rn-primitives/portal';
import { ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';

import * as SecureStore from 'expo-secure-store';

import { AuthProvider, useAuth } from '@/contexts/auth';
import { ONBOARDING_KEY } from '@/app/onboarding';
import {
  setupNotificationChannel,
  requestNotificationPermissions,
} from '@/features/notifications/permissions';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getTheme, NAV_THEME } from '@/lib/theme';

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
  const { isSignedIn, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    setMounted(true);
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
    if (!isSignedIn) return;
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
  const theme = getTheme(colorScheme);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider value={NAV_THEME[colorScheme]}>
          <AuthGuard />
          <View style={{ flex: 1, backgroundColor: theme.background }}>
            <Stack
              screenOptions={{
                animation: 'slide_from_right',
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
