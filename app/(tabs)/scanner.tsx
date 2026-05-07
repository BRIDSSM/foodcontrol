import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useCallback, useRef, useState } from 'react';
import { Linking, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { ResultCard } from '@/components/scanner/result-card';
import { SCANNER_BG, SCANNER_TEXT, SCANNER_TEXT_MUTED } from '@/components/scanner/scanner-theme';
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
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: SCANNER_BG }}>
        <Text className="text-sm" style={{ color: SCANNER_TEXT_MUTED }}>
          Verificando permissões...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    const canAsk = permission.canAskAgain;
    return (
      <View
        className="flex-1 items-center justify-center gap-4 px-8"
        style={{ backgroundColor: SCANNER_BG }}
      >
        <Text variant="h3" className="text-center" style={{ color: SCANNER_TEXT }}>
          Câmera necessária
        </Text>
        <Text className="text-center text-sm leading-6" style={{ color: SCANNER_TEXT_MUTED }}>
          {canAsk
            ? 'Precisamos de acesso à câmera para escanear códigos de barras.'
            : 'O acesso à câmera foi negado. Habilite a permissão nas configurações do dispositivo.'}
        </Text>
        <Button
          className="w-full"
          accessibilityLabel={canAsk ? 'Conceder permissão de câmera' : 'Abrir configurações'}
          onPress={canAsk ? requestPermission : () => Linking.openSettings()}
        >
          <Text>{canAsk ? 'Conceder permissão' : 'Abrir configurações'}</Text>
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: SCANNER_BG }}>
      <CameraView
        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{ barcodeTypes: [...BARCODE_TYPES] }}
      />

      <ViewportOverlay animating={!scanned} />

      <View
        className="absolute left-0 right-0 top-[60px] items-center gap-1.5"
        pointerEvents="none"
      >
        <Text
          className="text-[26px] font-extrabold uppercase"
          style={{ color: SCANNER_TEXT, letterSpacing: 2 }}
        >
          Scanner
        </Text>
        <Text className="text-[13px]" style={{ color: SCANNER_TEXT_MUTED }}>
          Aponte para um código de barras ou QR code
        </Text>
      </View>

      {scanned ? (
        <ResultCard state={lookupState} gtin={scanned.data} onScanAgain={handleScanAgain} />
      ) : null}
    </View>
  );
}
