import { ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="gap-1">
      <Text variant="muted" className="text-xs uppercase tracking-wide">
        {label}
      </Text>
      <Text variant="large">{value}</Text>
    </View>
  );
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); // TODO: passar para useProduct(id)

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}
    >
      {/* TODO: expo-image com image_url do produto */}

      {/* TODO: StatusBadge no topo — getStatus(expiration_date, warningDays) */}

      <Card>
        <CardContent className="gap-4 pt-2">
          {/* TODO: preencher com useProduct(id) via TanStack Query */}
          <InfoRow label="Nome" value="—" />
          <Separator />
          <View className="flex-row gap-6">
            <InfoRow label="Categoria" value="—" />
            <InfoRow label="Local" value="—" />
            <InfoRow label="Qtd." value="—" />
          </View>
          <Separator />
          <View className="gap-1">
            <Text variant="muted" className="text-xs uppercase tracking-wide">
              Validade
            </Text>
            <Text variant="large">—</Text>
            {/* TODO: <CountdownLabel diff={differenceInDays(expiration_date, today)} /> */}
          </View>
          {/* TODO: código de barras (se houver) */}
        </CardContent>
      </Card>

      <View className="flex-row gap-3">
        <Button
          variant="outline"
          className="flex-1"
          accessibilityLabel="Editar produto"
          onPress={() => router.push(`/product/edit/${id}`)}
        >
          <Text>Editar</Text>
        </Button>
        {/* TODO: abrir RemoveProductSheet — captura destino + registra em product_removals */}
        <Button
          variant="destructive"
          className="flex-1"
          accessibilityLabel="Remover produto"
          onPress={() => {}}
        >
          <Text>Remover</Text>
        </Button>
      </View>
    </ScrollView>
  );
}
