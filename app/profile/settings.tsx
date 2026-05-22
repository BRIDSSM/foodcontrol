import { Bell, Clock } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { ToggleSwitch } from '@/components/ui/toggle-switch';
import { useAuth } from '@/contexts/auth';
import { rescheduleAllNotifications } from '@/features/notifications/scheduler';
import { useProfile, useUpdateProfile } from '@/features/profile/queries';
import { useColorScheme } from '@/hooks/use-color-scheme';
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
          if (!user) return;
          if (notificationsEnabled) {
            rescheduleAllNotifications(user.id, warningDays).catch(() => {});
          } else {
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
      contentContainerStyle={{ padding: 16, gap: 24, paddingBottom: 40 + insets.bottom }}
    >
      {/* Alertas de validade */}
      <View className="gap-2">
        <Text className="px-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Alertas de validade
        </Text>
        <Card className="gap-0 py-0">
          <View className="flex-row items-center gap-3 px-4 py-4">
            <View
              className="h-9 w-9 items-center justify-center rounded-xl"
              style={{ backgroundColor: theme.accent }}
            >
              <Clock size={18} color={theme.accentForeground} />
            </View>
            <View className="flex-1">
              <Text className="font-semibold">Dias de antecedência</Text>
              <Text className="text-xs text-muted-foreground">
                Alerta amarelo N dias antes do vencimento
              </Text>
            </View>
            <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: theme.accent }}>
              <Text className="text-sm font-bold" style={{ color: theme.accentForeground }}>
                {warningDays}d
              </Text>
            </View>
          </View>

          <Separator />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 14 }}
          >
            {WARNING_OPTIONS.map((opt) => {
              const active = warningDays === opt;
              return (
                <Pressable
                  key={opt}
                  onPress={() => setWarningDays(opt)}
                  accessibilityLabel={`${opt} dias`}
                  className="rounded-full border px-4 py-2"
                  style={{
                    borderColor: active ? theme.primary : theme.border,
                    backgroundColor: active ? theme.primary : 'transparent',
                  }}
                >
                  <Text
                    className="text-sm font-medium"
                    style={{ color: active ? theme.primaryForeground : theme.mutedForeground }}
                  >
                    {opt} dias
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Card>
      </View>

      {/* Notificações */}
      <View className="gap-2">
        <Text className="px-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Notificações
        </Text>
        <Card className="gap-0 py-0">
          <View className="flex-row items-center justify-between px-4 py-4">
            <View className="flex-row items-center gap-3">
              <View
                className="h-9 w-9 items-center justify-center rounded-xl"
                style={{ backgroundColor: theme.accent }}
              >
                <Bell size={18} color={theme.accentForeground} />
              </View>
              <View>
                <Text className="font-semibold">Notificações diárias</Text>
                <Text className="text-xs text-muted-foreground">Alertas de validade às 09:00</Text>
              </View>
            </View>
            <ToggleSwitch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              accessibilityLabel="Ativar notificações"
            />
          </View>
        </Card>
      </View>

      {/* Salvar */}
      <View className="gap-2">
        <Button
          className="w-full"
          accessibilityLabel="Salvar configurações"
          onPress={save}
          disabled={!dirty || isPending}
        >
          <Text className="font-semibold">{isPending ? 'Salvando…' : 'Salvar configurações'}</Text>
        </Button>
        {dirty && (
          <Text className="text-center text-xs text-muted-foreground">
            Você tem alterações não salvas
          </Text>
        )}
      </View>
    </ScrollView>
  );
}
