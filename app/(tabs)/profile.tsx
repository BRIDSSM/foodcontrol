import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/contexts/auth';
import { useProfile } from '@/features/profile/queries';
import { supabase } from '@/lib/supabase';

function initials(name: string | null | undefined): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function MenuRow({
  label,
  onPress,
  destructive = false,
}: {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <Button
      variant="ghost"
      className="h-auto w-full flex-row items-center justify-between px-4 py-3.5"
      accessibilityLabel={label}
      onPress={onPress}
    >
      <Text className={destructive ? 'text-destructive' : undefined}>{label}</Text>
      {!destructive && <Text className="text-lg text-muted-foreground">›</Text>}
    </Button>
  );
}

export default function ProfileScreen() {
  const { user } = useAuth();
  const { data: profile } = useProfile();

  const displayName = profile?.full_name ?? user?.user_metadata?.full_name ?? '';
  const email = user?.email ?? '';

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 20, paddingBottom: 32 }}>
        {/* Avatar + dados do usuário */}
        <View className="items-center gap-3 py-6">
          <Avatar alt="Foto do usuário" className="h-20 w-20">
            <AvatarFallback>
              <Text className="text-2xl font-semibold">{initials(displayName)}</Text>
            </AvatarFallback>
          </Avatar>
          <View className="items-center gap-0.5">
            {displayName ? <Text variant="h3">{displayName}</Text> : null}
            <Text variant="muted">{email}</Text>
          </View>
        </View>

        {/* Menu principal */}
        <Card className="gap-0 py-0">
          <MenuRow label="Configurações" onPress={() => router.push('/profile/settings')} />
          <Separator />
          <MenuRow label="Sobre" onPress={() => {}} />
        </Card>

        {/* Sair */}
        <Card className="gap-0 py-0">
          <MenuRow label="Sair" onPress={signOut} destructive />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
