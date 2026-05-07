import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { SCANNER_ACCENT, SCANNER_OVERLAY, VIEWPORT_H, VIEWPORT_W } from './scanner-theme';

const CORNER_SIZE = 24;
const CORNER_THICKNESS = 3;
const SCAN_LINE_TRAVEL = 50;
const SCAN_LINE_DURATION_MS = 2000;

type Props = { animating: boolean };

export function ViewportOverlay({ animating }: Props) {
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animating) {
      scanLineAnim.stopAnimation();
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: SCAN_LINE_DURATION_MS,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: SCAN_LINE_DURATION_MS,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [animating, scanLineAnim]);

  const translateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCAN_LINE_TRAVEL, SCAN_LINE_TRAVEL],
  });

  return (
    <View style={styles.overlay} pointerEvents="none">
      <View style={styles.overlayTop} />
      <View style={styles.overlayMiddle}>
        <View style={styles.overlaySide} />
        <View style={styles.viewport}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
          {animating ? (
            <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />
          ) : null}
        </View>
        <View style={styles.overlaySide} />
      </View>
      <View style={styles.overlayBottom} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, flexDirection: 'column' },
  overlayTop: { flex: 1, backgroundColor: SCANNER_OVERLAY },
  overlayMiddle: { height: VIEWPORT_H, flexDirection: 'row' },
  overlaySide: { flex: 1, backgroundColor: SCANNER_OVERLAY },
  overlayBottom: { flex: 1.5, backgroundColor: SCANNER_OVERLAY },
  viewport: {
    width: VIEWPORT_W,
    height: VIEWPORT_H,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: SCANNER_ACCENT,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderTopRightRadius: 4,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderBottomRightRadius: 4,
  },
  scanLine: {
    width: VIEWPORT_W - 20,
    height: 2,
    backgroundColor: SCANNER_ACCENT,
    borderRadius: 1,
    shadowColor: SCANNER_ACCENT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
});
