/**
 * Bota Love App Theme
 * Color palette inspired by agro culture with warm, earthy tones
 */

import { Platform } from 'react-native';

// Re-exporta o sistema tipográfico premium
export * from './typography';

// Bota Love Color Palette
export const BotaLoveColors = {
  // Primary colors (gold/dourado elegante)
  primary: '#D4AD63',
  primaryLight: '#E5C88A',
  primaryDark: '#B8944D',
  
  // Secondary colors (dark brown leather)
  secondary: '#502914',
  secondaryLight: '#663C23',
  secondaryDark: '#3E1F0F',
  
  // Neutral colors
  neutralLight: '#FFF9E6',
  neutralMedium: '#A9927A',
  neutralDark: '#7A5841',
  
  // Text colors
  textPrimary: '#1F130C',
  textSecondary: '#502914',
  textLight: '#FFFFFF',
  
  // Background colors
  backgroundLight: '#EFEFEF',
  backgroundWhite: '#FFFFFF',
  
  // Status colors
  error: '#E53935',
  success: '#66BB6A',
  warning: '#FFA726',
  
  // Overlay
  overlay: 'rgba(31, 19, 12, 0.6)',
};

const tintColorLight = BotaLoveColors.primary;
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: BotaLoveColors.textPrimary,
    background: BotaLoveColors.backgroundWhite,
    tint: tintColorLight,
    icon: BotaLoveColors.neutralDark,
    tabIconDefault: BotaLoveColors.neutralMedium,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

/**
 * @deprecated Use FontFamily de './typography' ao invés
 * Mantido para compatibilidade retroativa
 */
export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'PlayfairDisplay-Regular',
    rounded: 'System',
    mono: 'Menlo',
  },
  default: {
    sans: 'Roboto',
    serif: 'PlayfairDisplay-Regular',
    rounded: 'Roboto',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "'Playfair Display', Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
