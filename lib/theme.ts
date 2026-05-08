import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';

/**
 * TypeScript mirror dos tokens definidos em `global.css`.
 *
 * Use `THEME[colorScheme]` em código que não passa por NativeWind/Tailwind
 * (animações imperativas, StyleSheet.create com cores dinâmicas, etc.).
 *
 * Mantenha sincronizado quando alterar `global.css`.
 */
export const STATUS_COLORS = {
  light: {
    safe: 'hsl(142, 70%, 35%)',
    warning: 'hsl(38, 86%, 42%)',
    expired: 'hsl(0, 72%, 51%)',
    safeBg: 'hsl(142, 60%, 94%)',
    warningBg: 'hsl(38, 86%, 93%)',
    expiredBg: 'hsl(0, 72%, 95%)',
  },
  dark: {
    safe: 'hsl(142, 65%, 50%)',
    warning: 'hsl(38, 86%, 55%)',
    expired: 'hsl(0, 62%, 55%)',
    safeBg: 'hsl(142, 35%, 15%)',
    warningBg: 'hsl(38, 40%, 16%)',
    expiredBg: 'hsl(0, 30%, 18%)',
  },
} as const;

export const THEME = {
  light: {
    background: 'hsl(0, 0%, 100%)',
    foreground: 'hsl(224, 30%, 12%)',
    card: 'hsl(0, 0%, 100%)',
    cardForeground: 'hsl(224, 30%, 12%)',
    popover: 'hsl(0, 0%, 100%)',
    popoverForeground: 'hsl(224, 30%, 12%)',
    primary: 'hsl(224, 76%, 48%)',
    primaryForeground: 'hsl(0, 0%, 100%)',
    secondary: 'hsl(224, 30%, 96%)',
    secondaryForeground: 'hsl(224, 30%, 18%)',
    muted: 'hsl(224, 20%, 96%)',
    mutedForeground: 'hsl(224, 12%, 45%)',
    accent: 'hsl(224, 30%, 94%)',
    accentForeground: 'hsl(224, 76%, 30%)',
    destructive: 'hsl(0, 72%, 51%)',
    destructiveForeground: 'hsl(0, 0%, 100%)',
    border: 'hsl(224, 20%, 90%)',
    input: 'hsl(224, 20%, 90%)',
    ring: 'hsl(224, 76%, 48%)',
    radius: '0.625rem',
    chart1: 'hsl(224, 76%, 48%)',
    chart2: 'hsl(142, 70%, 38%)',
    chart3: 'hsl(28, 86%, 56%)',
    chart4: 'hsl(270, 65%, 56%)',
    chart5: 'hsl(190, 80%, 45%)',
  },
  dark: {
    background: 'hsl(224, 30%, 8%)',
    foreground: 'hsl(224, 15%, 96%)',
    card: 'hsl(224, 28%, 11%)',
    cardForeground: 'hsl(224, 15%, 96%)',
    popover: 'hsl(224, 28%, 11%)',
    popoverForeground: 'hsl(224, 15%, 96%)',
    primary: 'hsl(224, 76%, 53%)',
    primaryForeground: 'hsl(0, 0%, 100%)',
    secondary: 'hsl(224, 25%, 18%)',
    secondaryForeground: 'hsl(224, 15%, 90%)',
    muted: 'hsl(224, 20%, 16%)',
    mutedForeground: 'hsl(224, 10%, 65%)',
    accent: 'hsl(224, 30%, 20%)',
    accentForeground: 'hsl(224, 76%, 78%)',
    destructive: 'hsl(0, 62%, 50%)',
    destructiveForeground: 'hsl(0, 0%, 100%)',
    border: 'hsl(224, 25%, 18%)',
    input: 'hsl(224, 25%, 18%)',
    ring: 'hsl(224, 76%, 60%)',
    radius: '0.625rem',
    chart1: 'hsl(224, 76%, 60%)',
    chart2: 'hsl(142, 65%, 50%)',
    chart3: 'hsl(28, 86%, 62%)',
    chart4: 'hsl(270, 65%, 65%)',
    chart5: 'hsl(190, 80%, 55%)',
  },
} as const;

export type ColorScheme = keyof typeof THEME;

export const NAV_THEME: Record<ColorScheme, Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      background: THEME.light.background,
      border: THEME.light.border,
      card: THEME.light.card,
      notification: THEME.light.destructive,
      primary: THEME.light.primary,
      text: THEME.light.foreground,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      background: THEME.dark.background,
      border: THEME.dark.border,
      card: THEME.dark.card,
      notification: THEME.dark.destructive,
      primary: THEME.dark.primary,
      text: THEME.dark.foreground,
    },
  },
};

export function getTheme(scheme: ColorScheme | null | undefined) {
  return scheme === 'dark' ? THEME.dark : THEME.light;
}
