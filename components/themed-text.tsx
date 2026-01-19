import { Text, type TextProps, TextStyle } from 'react-native';

import Typography, {
    combineTypography,
    TypographyColors
} from '@/constants/typography';
import { useThemeColor } from '@/hooks/use-theme-color';

/**
 * 🎨 TIPOS DE TEXTO DISPONÍVEIS
 * 
 * Hierarquia Visual (Ordem de Força):
 * 1. interestPrimary — Montserrat ExtraBold (impacto máximo)
 * 2. title — Playfair Display (elegância)
 * 3. profileInfo — Montserrat Condensed (clareza)
 * 4. interestSecondary — Playfair Italic (fluidez)
 */
export type TextVariant = 
  // Títulos Principais (Playfair Display)
  | 'title'
  | 'titleMedium'
  | 'titleSmall'
  | 'titleLarge'
  // Informações de Perfil (Montserrat Condensed)
  | 'profileInfo'
  | 'profileInfoSmall'
  | 'profileInfoLarge'
  | 'profileInfoDark'
  // Interesses Grandes (Montserrat ExtraBold)
  | 'interestPrimary'
  | 'interestPrimarySmall'
  | 'interestPrimaryLarge'
  // Interesses Cursivos (Playfair Italic)
  | 'interestSecondary'
  | 'interestSecondarySmall'
  | 'interestSecondaryLarge'
  | 'interestSecondaryAccent'
  // Variantes Auxiliares
  | 'body'
  | 'bodySmall'
  | 'bodyLarge'
  | 'label'
  | 'labelSmall'
  | 'link'
  | 'button'
  | 'buttonSmall'
  // Legacy (mantido para compatibilidade)
  | 'default'
  | 'defaultSemiBold'
  | 'subtitle';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  /**
   * Variante tipográfica premium
   * @default 'body'
   */
  variant?: TextVariant;
  /**
   * @deprecated Use 'variant' ao invés de 'type'
   */
  type?: TextVariant;
};

/**
 * Mapeamento de variantes para estilos
 */
const getVariantStyle = (variant: TextVariant): TextStyle => {
  switch (variant) {
    // Títulos Principais
    case 'title':
      return Typography.title;
    case 'titleMedium':
      return Typography.titleMedium;
    case 'titleSmall':
      return Typography.titleSmall;
    case 'titleLarge':
      return Typography.titleLarge;
    
    // Informações de Perfil
    case 'profileInfo':
      return Typography.profileInfo;
    case 'profileInfoSmall':
      return Typography.profileInfoSmall;
    case 'profileInfoLarge':
      return Typography.profileInfoLarge;
    case 'profileInfoDark':
      return Typography.profileInfoDark;
    
    // Interesses Grandes (Impacto)
    case 'interestPrimary':
      return Typography.interestPrimary;
    case 'interestPrimarySmall':
      return Typography.interestPrimarySmall;
    case 'interestPrimaryLarge':
      return Typography.interestPrimaryLarge;
    
    // Interesses Cursivos
    case 'interestSecondary':
      return Typography.interestSecondary;
    case 'interestSecondarySmall':
      return Typography.interestSecondarySmall;
    case 'interestSecondaryLarge':
      return Typography.interestSecondaryLarge;
    case 'interestSecondaryAccent':
      return Typography.interestSecondaryAccent;
    
    // Variantes Auxiliares
    case 'body':
    case 'default':
      return Typography.body;
    case 'bodySmall':
      return Typography.bodySmall;
    case 'bodyLarge':
      return Typography.bodyLarge;
    case 'label':
      return Typography.label;
    case 'labelSmall':
      return Typography.labelSmall;
    case 'link':
      return Typography.link;
    case 'button':
      return Typography.button;
    case 'buttonSmall':
      return Typography.buttonSmall;
    
    // Legacy
    case 'defaultSemiBold':
      return {
        ...Typography.body,
        fontWeight: '600',
      };
    case 'subtitle':
      return Typography.titleSmall;
    
    default:
      return Typography.body;
  }
};

/**
 * 🎨 ThemedText - Componente de Texto Premium
 * 
 * Sistema tipográfico Inner Circle Premium com suporte a:
 * - Títulos elegantes (Playfair Display)
 * - Informações de perfil (Montserrat Condensed)
 * - Interesses de impacto (Montserrat ExtraBold)
 * - Interesses cursivos (Playfair Italic)
 * 
 * @example
 * // Título principal
 * <ThemedText variant="title">Boa tarde, Roberta</ThemedText>
 * 
 * // Informação de perfil
 * <ThemedText variant="profileInfo">IDADE 42 – FERNANDO</ThemedText>
 * 
 * // Interesse principal (impacto)
 * <ThemedText variant="interestPrimary">SHOWS</ThemedText>
 * 
 * // Interesse secundário (cursivo)
 * <ThemedText variant="interestSecondary">academia · festas</ThemedText>
 */
export function ThemedText({
  style,
  lightColor,
  darkColor,
  variant,
  type,
  ...rest
}: ThemedTextProps) {
  // Suporta tanto 'variant' quanto 'type' (legacy)
  const activeVariant = variant || type || 'body';
  
  // Obtém o estilo base da variante
  const variantStyle = getVariantStyle(activeVariant);
  
  // Permite override de cor via props (para temas)
  const themeColor = useThemeColor(
    { light: lightColor, dark: darkColor }, 
    'text'
  );
  
  // Determina a cor final (variante tem prioridade, mas pode ser sobrescrita)
  const finalColor = lightColor || darkColor 
    ? themeColor 
    : variantStyle.color || themeColor;

  return (
    <Text
      style={[
        variantStyle,
        { color: finalColor },
        style, // Permite overrides customizados
      ]}
      {...rest}
    />
  );
}

/**
 * Exporta o sistema de tipografia para uso direto em StyleSheet
 */
export { combineTypography, Typography, TypographyColors };

