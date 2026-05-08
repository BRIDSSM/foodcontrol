import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';

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
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 20, paddingBottom: 32 }}>
        {/* Avatar + dados do usuário */}
        <View className="items-center gap-3 py-6">
          <Avatar alt="Foto do usuário" className="h-20 w-20">
            {/* TODO: <AvatarImage source={{ uri: profile.avatar_url }} /> quando disponível */}
            <AvatarFallback>
              {/* TODO: iniciais do nome (ex: "MV" para Maria Vasconcelos) */}
              <Text className="text-2xl font-semibold">—</Text>
            </AvatarFallback>
          </Avatar>
          <View className="items-center gap-0.5">
            {/* TODO: preencher com dados de profiles via TanStack Query */}
            <Text variant="h3">Nome do usuário</Text>
            <Text variant="muted">email@exemplo.com</Text>
          </View>
        </View>

        {/* Menu principal */}
        <Card className="gap-0 py-0">
          {/* TODO: router.push('/profile/edit') */}
          <MenuRow label="Editar perfil" onPress={() => {}} />
          <Separator />
          {/* TODO: router.push('/profile/settings') — warning_days, notificações, horário */}
          <MenuRow label="Configurações" onPress={() => {}} />
          <Separator />
          <MenuRow label="Sobre" onPress={() => {}} />
        </Card>

        {/* Sair */}
        <Card className="gap-0 py-0">
          {/* TODO: supabase.auth.signOut → router.replace('/(auth)/login') */}
          <MenuRow label="Sair" onPress={() => {}} destructive />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
