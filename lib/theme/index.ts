import { lightColors, darkColors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { shadows } from './shadows';

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

export const createTheme = (mode: 'light' | 'dark') => ({
  colors: mode === 'light' ? lightColors : darkColors,
  typography,
  spacing,
  shadows,
  borderRadius,
  mode,
});

export type Theme = ReturnType<typeof createTheme>;

export { lightColors, darkColors } from './colors';
export { typography } from './typography';
export { spacing } from './spacing';
export { shadows } from './shadows';
