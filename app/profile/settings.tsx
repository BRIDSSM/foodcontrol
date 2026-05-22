import { Bell, Clock } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/contexts/auth';
import { rescheduleAllNotifications } from '@/features/notifications/scheduler';
import { useProfile, useUpdateProfile } from '@/features/profile/queries';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { isExpoGo } from '@/lib/platform';
import { getTheme } from '@/lib/theme';

const WARNING_OPTIONS = [3, 5, 7, 10, 14, 30];

export default function SettingsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = getTheme(colorScheme);
  const insets = useSafeAreaInsets();

  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const [warningDays, setWarningDays] = useState(5);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    if (!profile || initialized.current) return;
    setWarningDays(profile.warning_days_before_expiry);
    setNotificationsEnabled(profile.notifications_enabled);
    initialized.current = true;
  }, [profile]);

  function save() {
    updateProfile(
      { warning_days_before_expiry: warningDays, notifications_enabled: notificationsEnabled },
      {
        onSuccess: () => {
          if (!user || isExpoGo) return;
          if (notificationsEnabled) {
            rescheduleAllNotifications(user.id, warningDays).catch(() => {});
          } else {
            const Notifications =
              require('expo-notifications') as typeof import('expo-notifications');
            Notifications.cancelAllScheduledNotificationsAsync().catch(() => {});
          }
        },
      },
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const dirty =
    profile &&
    (warningDays !== profile.warning_days_before_expiry ||
      notificationsEnabled !== profile.notifications_enabled);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 16, gap: 20, paddingBottom: 40 + insets.bottom }}
    >
      {/* Alerta de validade */}
      <Card className="gap-0 py-0">
        <View className="flex-row items-center gap-3 px-4 py-4">
          <Clock size={18} color={theme.mutedForeground} />
          <View className="flex-1">
            <Text className="font-medium">Dias de antecedência</Text>
            <Text className="text-xs text-muted-foreground">
              Alerta amarelo começa N dias antes de vencer
            </Text>
          </View>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingBottom: 16 }}
        >
          {WARNING_OPTIONS.map((opt) => {
            const active = warningDays === opt;
            return (
              <Pressable
                key={opt}
                onPress={() => setWarningDays(opt)}
                accessibilityLabel={`${opt} dias`}
                className="rounded-full border px-4 py-1.5"
                style={{
                  borderColor: active ? theme.primary : theme.border,
                  backgroundColor: active ? theme.primary : 'transparent',
                }}
              >
                <Text
                  className="text-sm font-medium"
                  style={{ color: active ? theme.primaryForeground : theme.mutedForeground }}
                >
                  {opt}d
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </Card>

      {/* Notificações */}
      <Card className="gap-0 py-0">
        <View className="flex-row items-center justify-between px-4 py-4">
          <View className="flex-row items-center gap-3">
            <Bell size={18} color={theme.mutedForeground} />
            <View>
              <Text className="font-medium">Notificações</Text>
              <Text className="text-xs text-muted-foreground">Alertas de validade diários</Text>
            </View>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ true: theme.primary }}
            accessibilityLabel="Ativar notificações"
          />
        </View>
      </Card>

      {/* Salvar */}
      <Button
        className="w-full"
        accessibilityLabel="Salvar configurações"
        onPress={save}
        disabled={!dirty || isPending}
      >
        <Text>{isPending ? 'Salvando…' : 'Salvar'}</Text>
      </Button>
    </ScrollView>
  );
}
