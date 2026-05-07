import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ResultCard } from '@/components/scanner/result-card';
import {
  SCANNER_ACCENT,
  SCANNER_BG,
  SCANNER_TEXT,
  SCANNER_TEXT_MUTED,
} from '@/components/scanner/scanner-theme';
import { ViewportOverlay } from '@/components/scanner/viewport-overlay';
import { useProductLookup } from '@/hooks/use-product-lookup';
import type { ScannedBarcode } from '@/types/cosmos';
import { SCAN_CONFIRMS_NEEDED, isValidGS1 } from '@/utils/barcode';

const BARCODE_TYPES = ['ean13', 'ean8', 'upc_a', 'upc_e', 'itf14'] as const;

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState<ScannedBarcode | null>(null);

  const pendingRef = useRef<{ data: string; count: number } | null>(null);
  const { state: lookupState, lookup, reset: resetLookup } = useProductLookup();

  const handleBarcodeScanned = useCallback(
    ({ type, data }: { type: string; data: string }) => {
      if (scanned) return;
      if (!isValidGS1(data)) return;

      const pending = pendingRef.current;

      if (pending && pending.data === data) {
        const next = pending.count + 1;
        if (next >= SCAN_CONFIRMS_NEEDED) {
          pendingRef.current = null;
          setScanned({ type, data, scannedAt: new Date() });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          lookup(data);
        } else {
          pendingRef.current = { data, count: next };
        }
      } else {
        pendingRef.current = { data, count: 1 };
      }
    },
    [scanned, lookup],
  );

  const handleScanAgain = useCallback(() => {
    pendingRef.current = null;
    setScanned(null);
    resetLookup();
  }, [resetLookup]);

  if (!permission) {
    return (
      <View style={styles.centered}>
        <Text style={styles.infoText}>Verificando permissões...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permissionTitle}>Câmera necessária</Text>
        <Text style={styles.permissionBody}>
          Precisamos de acesso à câmera para escanear códigos de barras.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Conceder permissão de câmera"
          style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
          onPress={requestPermission}
        >
          <Text style={styles.btnText}>Conceder permissão</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{ barcodeTypes: [...BARCODE_TYPES] }}
      />

      <ViewportOverlay animating={!scanned} />

      <View style={styles.header} pointerEvents="none">
        <Text style={styles.headerTitle}>Scanner</Text>
        <Text style={styles.headerSub}>Aponte para um código de barras ou QR code</Text>
      </View>

      {scanned ? (
        <ResultCard state={lookupState} gtin={scanned.data} onScanAgain={handleScanAgain} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: SCANNER_BG },
  centered: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  permissionTitle: { color: SCANNER_TEXT, fontSize: 22, fontWeight: '700', textAlign: 'center' },
  permissionBody: { color: '#AAA', fontSize: 14, textAlign: 'center', lineHeight: 22 },
  infoText: { color: '#AAA', fontSize: 14 },
  header: { position: 'absolute', top: 60, left: 0, right: 0, alignItems: 'center', gap: 6 },
  headerTitle: {
    color: SCANNER_TEXT,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  headerSub: { color: SCANNER_TEXT_MUTED, fontSize: 13 },
  btn: {
    backgroundColor: SCANNER_ACCENT,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  btnPressed: { opacity: 0.8 },
  btnText: { color: '#0D0D0D', fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },
});
