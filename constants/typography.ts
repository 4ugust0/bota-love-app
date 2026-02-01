/**
 * 🎨 BOTA LOVE APP - SISTEMA TIPOGRÁFICO PREMIUM
 * Estilo Inner Circle Premium
 * 
 * Hierarquia Visual (Ordem de Força):
 * 1. Interesses Grandes — Montserrat ExtraBold
 * 2. Títulos Principais — Playfair Display
 * 3. Informações do Perfil — Montserrat Condensed
 * 4. Interesses Cursivos — Playfair Italic
 */

import { Platform, TextStyle } from 'react-native';

// ============================================
// 📝 FONT FAMILIES
// ============================================

export const FontFamily = {
  // Playfair Display - Títulos elegantes e sofisticados
  playfairRegular: 'PlayfairDisplay-Regular',
  playfairMedium: 'PlayfairDisplay-Medium',
  playfairItalic: 'PlayfairDisplay-Italic',
  
  // Montserrat - Informações e interesses
  montserratCondensedSemiBold: 'MontserratCondensed-SemiBold',
  montserratExtraBold: 'Montserrat-ExtraBold',
  
  // Fallback para sistema
  systemDefault: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
} as const;

// ============================================
// 📏 FONT SIZES
// ============================================

export const FontSize = {
  // Títulos Principais
  titleXL: 34,
  titleLG: 32,
  titleMD: 30,
  titleSM: 28,
  
  // Interesses Grandes (Impacto)
  interestXL: 30,
  interestLG: 28,
  interestMD: 26,
  interestSM: 24,
  
  // Interesses Cursivos
  cursiveXL: 22,
  cursiveLG: 20,
  cursiveMD: 19,
  cursiveSM: 18,
  
  // Informações de Perfil
  profileLG: 16,
  profileMD: 15,
  profileSM: 14,
  
  // Corpo de texto
  bodyLG: 18,
  bodyMD: 16,
  bodySM: 14,
  bodyXS: 12,
  
  // Labels e captions
  labelLG: 14,
  labelMD: 12,
  labelSM: 10,
} as const;

// ============================================
// 📐 LINE HEIGHTS
// ============================================

/**
 * Line heights calculados baseados nos multiplicadores do guia:
 * - Títulos: fontSize * 1.15
 * - Perfil: fontSize * 1.05
 * - Interesses Grandes: fontSize * 1.0
 * - Interesses Cursivos: fontSize * 1.2
 */
export const LineHeight = {
  // Títulos (multiplicador 1.15)
  titleXL: Math.round(34 * 1.15), // 39
  titleLG: Math.round(32 * 1.15), // 37
  titleMD: Math.round(30 * 1.15), // 35
  titleSM: Math.round(28 * 1.15), // 32
  
  // Interesses Grandes (multiplicador 1.0)
  interestXL: 30,
  interestLG: 28,
  interestMD: 26,
  interestSM: 24,
  
  // Interesses Cursivos (multiplicador 1.2)
  cursiveXL: Math.round(22 * 1.2), // 26
  cursiveLG: Math.round(20 * 1.2), // 24
  cursiveMD: Math.round(19 * 1.2), // 23
  cursiveSM: Math.round(18 * 1.2), // 22
  
  // Perfil (multiplicador 1.05)
  profileLG: Math.round(16 * 1.05), // 17
  profileMD: Math.round(15 * 1.05), // 16
  profileSM: Math.round(14 * 1.05), // 15
  
  // Corpo
  bodyLG: Math.round(18 * 1.5), // 27
  bodyMD: Math.round(16 * 1.5), // 24
  bodySM: Math.round(14 * 1.5), // 21
  bodyXS: Math.round(12 * 1.5), // 18
} as const;

// ============================================
// 🔤 LETTER SPACING
// ============================================

export const LetterSpacing = {
  none: 0,
  tight: 0.2,
  normal: 0.5,
  wide: 0.8,
  wider: 1.0,
  widest: 1.5,
} as const;

// ============================================
// 🎨 TYPOGRAPHY COLORS
// ============================================

export const TypographyColors = {
  // Cores primárias de texto
  dark: '#111111',
  darkSecondary: '#333333',
  
  // Cores claras
  light: '#FFFFFF',
  lightSecondary: 'rgba(255, 255, 255, 0.85)',
  
  // Cor de destaque (interesses grandes)
  accent: '#D4AD63',
  accentLight: '#E5C88A',
  
  // Cores do tema Bota Love
  primary: '#D4AD63',
  secondary: '#502914',
} as const;

// ============================================
// 🎯 TEXT VARIANTS (ESTILOS PRONTOS)
// ============================================

export const Typography = {
  /**
   * ⭐ TÍTULO PRINCIPAL
   * Uso: boas-vindas, títulos de seções, chamadas principais
   * Exemplos: "Boa tarde, Roberta", "Comece novas conexões"
   */
  title: {
    fontFamily: FontFamily.playfairRegular,
    fontSize: FontSize.titleLG,
    lineHeight: LineHeight.titleLG,
    letterSpacing: LetterSpacing.none,
    color: TypographyColors.dark,
  } as TextStyle,
  
  titleMedium: {
    fontFamily: FontFamily.playfairMedium,
    fontSize: FontSize.titleLG,
    lineHeight: LineHeight.titleLG,
    letterSpacing: LetterSpacing.none,
    color: TypographyColors.dark,
  } as TextStyle,
  
  titleSmall: {
    fontFamily: FontFamily.playfairRegular,
    fontSize: FontSize.titleSM,
    lineHeight: LineHeight.titleSM,
    letterSpacing: LetterSpacing.none,
    color: TypographyColors.dark,
  } as TextStyle,
  
  titleLarge: {
    fontFamily: FontFamily.playfairMedium,
    fontSize: FontSize.titleXL,
    lineHeight: LineHeight.titleXL,
    letterSpacing: LetterSpacing.none,
    color: TypographyColors.dark,
  } as TextStyle,
  
  /**
   * 🖤 INFORMAÇÕES DE PERFIL
   * Uso: idade, nome, profissão, cidade, altura, nacionalidade
   * Exemplo: "IDADE 42 – FERNANDO – EMPRESÁRIO"
   */
  profileInfo: {
    fontFamily: FontFamily.montserratCondensedSemiBold,
    fontSize: FontSize.profileMD,
    lineHeight: LineHeight.profileMD,
    letterSpacing: LetterSpacing.normal,
    textTransform: 'uppercase',
    color: TypographyColors.light,
  } as TextStyle,
  
  profileInfoSmall: {
    fontFamily: FontFamily.montserratCondensedSemiBold,
    fontSize: FontSize.profileSM,
    lineHeight: LineHeight.profileSM,
    letterSpacing: LetterSpacing.wide,
    textTransform: 'uppercase',
    color: TypographyColors.light,
  } as TextStyle,
  
  profileInfoLarge: {
    fontFamily: FontFamily.montserratCondensedSemiBold,
    fontSize: FontSize.profileLG,
    lineHeight: LineHeight.profileLG,
    letterSpacing: LetterSpacing.normal,
    textTransform: 'uppercase',
    color: TypographyColors.light,
  } as TextStyle,
  
  profileInfoDark: {
    fontFamily: FontFamily.montserratCondensedSemiBold,
    fontSize: FontSize.profileMD,
    lineHeight: LineHeight.profileMD,
    letterSpacing: LetterSpacing.normal,
    textTransform: 'uppercase',
    color: TypographyColors.dark,
  } as TextStyle,
  
  /**
   * 🟧 INTERESSES GRANDES (IMPACTO)
   * Uso: interesses principais do perfil
   * Exemplos: "SHOWS", "RESTAURANTES"
   */
  interestPrimary: {
    fontFamily: FontFamily.montserratExtraBold,
    fontSize: FontSize.interestMD,
    lineHeight: LineHeight.interestMD,
    letterSpacing: LetterSpacing.tight,
    textTransform: 'uppercase',
    color: TypographyColors.accent,
  } as TextStyle,
  
  interestPrimarySmall: {
    fontFamily: FontFamily.montserratExtraBold,
    fontSize: FontSize.interestSM,
    lineHeight: LineHeight.interestSM,
    letterSpacing: LetterSpacing.none,
    textTransform: 'uppercase',
    color: TypographyColors.accent,
  } as TextStyle,
  
  interestPrimaryLarge: {
    fontFamily: FontFamily.montserratExtraBold,
    fontSize: FontSize.interestXL,
    lineHeight: LineHeight.interestXL,
    letterSpacing: LetterSpacing.tight,
    textTransform: 'uppercase',
    color: TypographyColors.accent,
  } as TextStyle,
  
  /**
   * 🟡 INTERESSES CURSIVOS
   * Uso: interesses secundários
   * Exemplos: "academia · festas · festivais"
   */
  interestSecondary: {
    fontFamily: FontFamily.playfairItalic,
    fontSize: FontSize.cursiveLG,
    lineHeight: LineHeight.cursiveLG,
    letterSpacing: LetterSpacing.none,
    color: TypographyColors.light,
  } as TextStyle,
  
  interestSecondarySmall: {
    fontFamily: FontFamily.playfairItalic,
    fontSize: FontSize.cursiveSM,
    lineHeight: LineHeight.cursiveSM,
    letterSpacing: LetterSpacing.none,
    color: TypographyColors.light,
  } as TextStyle,
  
  interestSecondaryLarge: {
    fontFamily: FontFamily.playfairItalic,
    fontSize: FontSize.cursiveXL,
    lineHeight: LineHeight.cursiveXL,
    letterSpacing: LetterSpacing.none,
    color: TypographyColors.light,
  } as TextStyle,
  
  interestSecondaryAccent: {
    fontFamily: FontFamily.playfairItalic,
    fontSize: FontSize.cursiveLG,
    lineHeight: LineHeight.cursiveLG,
    letterSpacing: LetterSpacing.none,
    color: TypographyColors.accentLight,
  } as TextStyle,
  
  // ============================================
  // 📝 VARIANTES AUXILIARES
  // ============================================
  
  /**
   * Corpo de texto padrão
   */
  body: {
    fontFamily: FontFamily.systemDefault,
    fontSize: FontSize.bodyMD,
    lineHeight: LineHeight.bodyMD,
    letterSpacing: LetterSpacing.none,
    color: TypographyColors.dark,
  } as TextStyle,
  
  bodySmall: {
    fontFamily: FontFamily.systemDefault,
    fontSize: FontSize.bodySM,
    lineHeight: LineHeight.bodySM,
    letterSpacing: LetterSpacing.none,
    color: TypographyColors.darkSecondary,
  } as TextStyle,
  
  bodyLarge: {
    fontFamily: FontFamily.systemDefault,
    fontSize: FontSize.bodyLG,
    lineHeight: LineHeight.bodyLG,
    letterSpacing: LetterSpacing.none,
    color: TypographyColors.dark,
  } as TextStyle,
  
  /**
   * Labels e captions
   */
  label: {
    fontFamily: FontFamily.montserratCondensedSemiBold,
    fontSize: FontSize.labelMD,
    lineHeight: Math.round(FontSize.labelMD * 1.2),
    letterSpacing: LetterSpacing.wide,
    textTransform: 'uppercase',
    color: TypographyColors.darkSecondary,
  } as TextStyle,
  
  labelSmall: {
    fontFamily: FontFamily.montserratCondensedSemiBold,
    fontSize: FontSize.labelSM,
    lineHeight: Math.round(FontSize.labelSM * 1.2),
    letterSpacing: LetterSpacing.wider,
    textTransform: 'uppercase',
    color: TypographyColors.darkSecondary,
  } as TextStyle,
  
  /**
   * Links e ações
   */
  link: {
    fontFamily: FontFamily.systemDefault,
    fontSize: FontSize.bodyMD,
    lineHeight: LineHeight.bodyMD,
    letterSpacing: LetterSpacing.none,
    color: TypographyColors.primary,
    textDecorationLine: 'underline',
  } as TextStyle,
  
  /**
   * Botões
   */
  button: {
    fontFamily: FontFamily.montserratCondensedSemiBold,
    fontSize: FontSize.profileMD,
    lineHeight: LineHeight.profileMD,
    letterSpacing: LetterSpacing.wide,
    textTransform: 'uppercase',
    color: TypographyColors.light,
  } as TextStyle,
  
  buttonSmall: {
    fontFamily: FontFamily.montserratCondensedSemiBold,
    fontSize: FontSize.labelLG,
    lineHeight: Math.round(FontSize.labelLG * 1.1),
    letterSpacing: LetterSpacing.normal,
    textTransform: 'uppercase',
    color: TypographyColors.light,
  } as TextStyle,
} as const;

// ============================================
// 🔧 HELPERS / UTILITIES
// ============================================

/**
 * Gera lineHeight proporcional baseado no fontSize
 */
export const getLineHeight = (fontSize: number, multiplier: number = 1.5): number => {
  return Math.round(fontSize * multiplier);
};

/**
 * Combina estilos de tipografia com overrides
 */
export const combineTypography = (
  base: TextStyle,
  overrides?: Partial<TextStyle>
): TextStyle => {
  return { ...base, ...overrides };
};

/**
 * Retorna cor de texto baseada no fundo
 */
export const getTextColorForBackground = (
  isDark: boolean
): string => {
  return isDark ? TypographyColors.light : TypographyColors.dark;
};

// ============================================
// 📦 EXPORTS
// ============================================

export default Typography;
