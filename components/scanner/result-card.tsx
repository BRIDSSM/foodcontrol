import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

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
};

export function ResultCard({ state, gtin, onScanAgain }: Props) {
  return (
    <View style={styles.card}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {state.status === 'loading' ? <LoadingRow /> : null}
        {state.status === 'error' ? <ErrorRow message={state.message} gtin={gtin} /> : null}
        {state.status === 'success' ? <ProductView product={state.product} /> : null}
      </ScrollView>

      <View style={styles.divider} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Escanear novamente"
        style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
        onPress={onScanAgain}
      >
        <Text style={styles.btnText}>Escanear novamente</Text>
      </Pressable>
    </View>
  );
}

function LoadingRow() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="small" color={SCANNER_ACCENT} />
      <Text style={styles.loadingText}>Consultando base de produtos...</Text>
    </View>
  );
}

function ErrorRow({ message, gtin }: { message: string; gtin: string }) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Produto não encontrado</Text>
      <Text style={styles.errorMessage}>{message}</Text>
      <Text style={styles.errorGtin}>GTIN: {gtin}</Text>
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
      <View style={styles.productHeader}>
        {product.thumbnail ? (
          <Image
            source={{ uri: product.thumbnail }}
            style={styles.productImage}
            contentFit="contain"
            transition={150}
          />
        ) : (
          <View style={styles.productImagePlaceholder}>
            <Text style={styles.productImagePlaceholderText}>sem imagem</Text>
          </View>
        )}
        <View style={styles.productHeaderInfo}>
          <Text style={styles.productName} numberOfLines={3}>
            {product.description}
          </Text>
          {product.brand ? (
            <View style={styles.brandRow}>
              {product.brand.picture ? (
                <Image
                  source={{ uri: product.brand.picture }}
                  style={styles.brandLogo}
                  contentFit="contain"
                />
              ) : null}
              <Text style={styles.brandName}>{product.brand.name}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailsGrid}>
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
          <DetailItem label="NCM" value={`${product.ncm.code} — ${product.ncm.description}`} />
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
          <View style={styles.divider} />
          <Text style={styles.sectionLabel}>Preços de mercado</Text>
          <View style={styles.priceRow}>
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
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function PriceChip({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={[styles.priceChip, accent ? styles.priceChipAccent : null]}>
      <Text style={[styles.priceChipLabel, accent ? styles.priceChipLabelAccent : null]}>
        {label}
      </Text>
      <Text style={[styles.priceChipValue, accent ? styles.priceChipValueAccent : null]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
    maxHeight: '55%',
    backgroundColor: SCANNER_SURFACE,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 16,
    gap: 12,
  },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  loadingText: { color: SCANNER_TEXT_MUTED, fontSize: 13 },
  errorContainer: { gap: 6, paddingVertical: 4 },
  errorTitle: { color: SCANNER_ERROR, fontSize: 15, fontWeight: '700' },
  errorMessage: { color: SCANNER_TEXT_MUTED, fontSize: 13 },
  errorGtin: { color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 4 },
  productHeader: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  productImage: { width: 80, height: 80, borderRadius: 10, backgroundColor: '#1E1E1E' },
  productImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImagePlaceholderText: { color: 'rgba(255,255,255,0.2)', fontSize: 10 },
  productHeaderInfo: { flex: 1, gap: 6 },
  productName: { color: SCANNER_TEXT, fontSize: 14, fontWeight: '700', lineHeight: 20 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  brandLogo: { width: 20, height: 20, borderRadius: 4, backgroundColor: '#1E1E1E' },
  brandName: { color: SCANNER_ACCENT, fontSize: 12, fontWeight: '600' },
  detailsGrid: { gap: 8 },
  detailItem: { gap: 2 },
  detailLabel: {
    color: SCANNER_TEXT_DIM,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  detailValue: { color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 18 },
  sectionLabel: {
    color: SCANNER_TEXT_DIM,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  priceRow: { flexDirection: 'row', gap: 8 },
  priceChip: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: SCANNER_SURFACE_ALT,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 3,
  },
  priceChipAccent: { backgroundColor: 'rgba(0,229,200,0.1)', borderColor: 'rgba(0,229,200,0.3)' },
  priceChipLabel: {
    color: SCANNER_TEXT_DIM,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  priceChipLabelAccent: { color: SCANNER_ACCENT },
  priceChipValue: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '700' },
  priceChipValueAccent: { color: SCANNER_ACCENT },
  divider: { height: 1, backgroundColor: SCANNER_DIVIDER },
  btn: {
    backgroundColor: SCANNER_ACCENT,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnPressed: { opacity: 0.8 },
  btnText: { color: '#0D0D0D', fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },
});
