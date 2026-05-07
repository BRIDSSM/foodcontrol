import { THEME } from '@/lib/theme';

/**
 * Scanner UI é sempre dark (sobreposição da câmera). Cores derivadas do
 * `lib/theme` no modo dark + alguns valores específicos da câmera (overlay
 * preto puro, divisores semi-transparentes).
 */

export const SCANNER_ACCENT = THEME.dark.primary;
export const SCANNER_BG = '#000';
export const SCANNER_SURFACE = THEME.dark.card;
export const SCANNER_SURFACE_ALT = THEME.dark.muted;
export const SCANNER_OVERLAY = 'rgba(0,0,0,0.60)';
export const SCANNER_TEXT = THEME.dark.foreground;
export const SCANNER_TEXT_MUTED = THEME.dark.mutedForeground;
export const SCANNER_TEXT_DIM = 'rgba(255,255,255,0.35)';
export const SCANNER_DIVIDER = 'rgba(255,255,255,0.07)';
export const SCANNER_ERROR = THEME.dark.destructive;

export const VIEWPORT_W = 300;
export const VIEWPORT_H = 140;
