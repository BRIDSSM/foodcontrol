import { Image } from 'expo-image';
import { ScrollView, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import type { LookupState } from '@/hooks/use-product-lookup';
import type { CosmosProduct } from '@/types/cosmos';
import { formatBRL } from '@/utils/barcode';

import {
  SCANNER_ACCENT,
  SCANNER_DIVIDER,
  SCANNER_ERROR,
  SCANNER_SURFACE,
  SCANNER_SURFACE_ALT,
  SCANNER_TEXT,
  SCANNER_TEXT_DIM,
  SCANNER_TEXT_MUTED,
} from './scanner-theme';

type Props = {
  state: LookupState;
  gtin: string;
  onScanAgain: () => void;
  onUseProduct?: (product: CosmosProduct, gtin: string) => void;
};

export function ResultCard({ state, gtin, onScanAgain, onUseProduct }: Props) {
  return (
    <View
      className="absolute bottom-10 left-4 right-4 max-h-[55%] gap-3 rounded-[20px] p-5"
      style={{
        backgroundColor: SCANNER_SURFACE,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 16,
      }}
    >
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {state.status === 'loading' ? <LoadingRow /> : null}
        {state.status === 'error' ? <ErrorRow message={state.message} gtin={gtin} /> : null}
        {state.status === 'success' ? <ProductView product={state.product} /> : null}
      </ScrollView>

      <Separator style={{ backgroundColor: SCANNER_DIVIDER }} />

      <View className="gap-2">
        {state.status === 'success' && onUseProduct ? (
          <Button
            className="w-full"
            accessibilityLabel="Usar este produto"
            onPress={() => onUseProduct(state.product, gtin)}
          >
            <Text>Usar este produto</Text>
          </Button>
        ) : null}
        {state.status === 'error' && onUseProduct ? (
          <Button
            variant="outline"
            className="w-full"
            accessibilityLabel="Preencher manualmente"
            onPress={() =>
              onUseProduct(
                {
                  description: '',
                  gtin: Number(gtin),
                  thumbnail: null,
                  avg_price: null,
                  min_price: null,
                  max_price: null,
                  net_weight: null,
                  gross_weight: null,
                  brand: null,
                  category: null,
                  ncm: null,
                  gtins: [],
                },
                gtin,
              )
            }
          >
            <Text style={{ color: SCANNER_TEXT }}>Preencher manualmente</Text>
          </Button>
        ) : null}
        <Button
          variant={state.status === 'success' ? 'outline' : 'default'}
          className="w-full"
          accessibilityLabel="Escanear novamente"
          onPress={onScanAgain}
          style={state.status !== 'success' ? undefined : { borderColor: 'rgba(255,255,255,0.15)' }}
        >
          <Text style={state.status === 'success' ? { color: SCANNER_TEXT } : undefined}>
            Escanear novamente
          </Text>
        </Button>
      </View>
    </View>
  );
}

function LoadingRow() {
  return (
    <View className="gap-3 py-2">
      <View className="flex-row items-start gap-3.5">
        <Skeleton
          className="rounded-[10px]"
          style={{ width: 80, height: 80, backgroundColor: SCANNER_SURFACE_ALT }}
        />
        <View className="flex-1 gap-2 pt-1">
          <Skeleton
            className="h-3.5 w-full rounded"
            style={{ backgroundColor: SCANNER_SURFACE_ALT }}
          />
          <Skeleton
            className="h-3.5 w-3/4 rounded"
            style={{ backgroundColor: SCANNER_SURFACE_ALT }}
          />
          <Skeleton
            className="h-3 w-1/2 rounded"
            style={{ backgroundColor: SCANNER_SURFACE_ALT }}
          />
        </View>
      </View>
      <Separator style={{ backgroundColor: SCANNER_DIVIDER }} />
      <View className="gap-2">
        <Skeleton className="h-3 w-1/4 rounded" style={{ backgroundColor: SCANNER_SURFACE_ALT }} />
        <Skeleton
          className="h-3.5 w-full rounded"
          style={{ backgroundColor: SCANNER_SURFACE_ALT }}
        />
        <Skeleton className="h-3 w-1/4 rounded" style={{ backgroundColor: SCANNER_SURFACE_ALT }} />
        <Skeleton
          className="h-3.5 w-3/4 rounded"
          style={{ backgroundColor: SCANNER_SURFACE_ALT }}
        />
      </View>
    </View>
  );
}

function ErrorRow({ message, gtin }: { message: string; gtin: string }) {
  return (
    <View className="gap-1.5 py-1">
      <Text className="text-[15px] font-bold" style={{ color: SCANNER_ERROR }}>
        Produto não encontrado
      </Text>
      <Text className="text-[13px]" style={{ color: SCANNER_TEXT_MUTED }}>
        {message}
      </Text>
      <Text className="mt-1 text-[12px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
        GTIN: {gtin}
      </Text>
    </View>
  );
}

function ProductView({ product }: { product: CosmosProduct }) {
  const unit = product.gtins?.[0]?.commercial_unit;
  const avgPrice = formatBRL(product.avg_price);
  const minPrice = formatBRL(product.min_price);
  const maxPrice = formatBRL(product.max_price);
  const hasPrices = avgPrice || minPrice || maxPrice;

  return (
    <View>
      <View className="flex-row items-start gap-3.5">
        {product.thumbnail ? (
          <Image
            source={{ uri: product.thumbnail }}
            style={{ width: 80, height: 80, borderRadius: 10, backgroundColor: '#1E1E1E' }}
            contentFit="contain"
            transition={150}
          />
        ) : (
          <View
            className="items-center justify-center rounded-[10px]"
            style={{ width: 80, height: 80, backgroundColor: '#1E1E1E' }}
          >
            <Text className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
              sem imagem
            </Text>
          </View>
        )}
        <View className="flex-1 gap-1.5">
          <Text
            className="text-sm font-bold leading-5"
            numberOfLines={3}
            style={{ color: SCANNER_TEXT }}
          >
            {product.description}
          </Text>
          {product.brand ? (
            <View className="flex-row items-center gap-1.5">
              {product.brand.picture ? (
                <Image
                  source={{ uri: product.brand.picture }}
                  style={{ width: 20, height: 20, borderRadius: 4, backgroundColor: '#1E1E1E' }}
                  contentFit="contain"
                />
              ) : null}
              <Text className="text-[12px] font-semibold" style={{ color: SCANNER_ACCENT }}>
                {product.brand.name}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <Separator className="my-3" style={{ backgroundColor: SCANNER_DIVIDER }} />

      <View className="gap-2">
        <DetailItem label="GTIN" value={String(product.gtin)} />
        {product.category ? (
          <DetailItem label="Categoria" value={product.category.description} />
        ) : null}
        {unit ? (
          <DetailItem
            label="Embalagem"
            value={`${unit.type_packaging}${
              unit.quantity_packaging > 1 ? ` × ${unit.quantity_packaging}` : ''
            }`}
          />
        ) : null}
        {product.ncm ? (
          <DetailItem label="NCM" value={`${product.ncm.code} - ${product.ncm.description}`} />
        ) : null}
        {product.net_weight ? (
          <DetailItem label="Peso líquido" value={`${product.net_weight} g`} />
        ) : null}
        {product.gross_weight ? (
          <DetailItem label="Peso bruto" value={`${product.gross_weight} g`} />
        ) : null}
      </View>

      {hasPrices ? (
        <>
          <Separator className="my-3" style={{ backgroundColor: SCANNER_DIVIDER }} />
          <Text
            className="mb-2 text-[10px] font-semibold uppercase"
            style={{ color: SCANNER_TEXT_DIM, letterSpacing: 0.8 }}
          >
            Preços de mercado
          </Text>
          <View className="flex-row gap-2">
            {minPrice ? <PriceChip label="Mínimo" value={minPrice} /> : null}
            {avgPrice ? <PriceChip label="Médio" value={avgPrice} accent /> : null}
            {maxPrice ? <PriceChip label="Máximo" value={maxPrice} /> : null}
          </View>
        </>
      ) : null}
    </View>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <View className="gap-0.5">
      <Text
        className="text-[10px] font-semibold uppercase"
        style={{ color: SCANNER_TEXT_DIM, letterSpacing: 0.8 }}
      >
        {label}
      </Text>
      <Text className="text-[13px] leading-[18px]" style={{ color: 'rgba(255,255,255,0.85)' }}>
        {value}
      </Text>
    </View>
  );
}

function PriceChip({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View
      className="flex-1 items-center gap-0.5 rounded-[10px] px-2 py-2.5"
      style={{
        backgroundColor: accent ? 'rgba(0,229,200,0.1)' : SCANNER_SURFACE_ALT,
        borderWidth: 1,
        borderColor: accent ? 'rgba(0,229,200,0.3)' : 'rgba(255,255,255,0.06)',
      }}
    >
      <Text
        className="text-[10px] font-semibold uppercase"
        style={{ color: accent ? SCANNER_ACCENT : SCANNER_TEXT_DIM, letterSpacing: 0.8 }}
      >
        {label}
      </Text>
      <Text
        className="text-[13px] font-bold"
        style={{ color: accent ? SCANNER_ACCENT : 'rgba(255,255,255,0.8)' }}
      >
        {value}
      </Text>
    </View>
  );
}
