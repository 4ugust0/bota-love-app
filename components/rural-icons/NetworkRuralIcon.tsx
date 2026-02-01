import * as React from 'react';
import Svg, { Circle, G, Line, Path, SvgProps } from 'react-native-svg';

interface NetworkRuralIconProps extends SvgProps {
  size?: number;
  color?: string;
  secondaryColor?: string;
}

/**
 * Ícone Network Rural
 * Representa conexões profissionais no agro
 * Combina elementos de networking (pessoas conectadas) com elementos rurais (planta/crescimento)
 */
export default function NetworkRuralIcon({
  size = 24,
  color = '#D4AD63',
  secondaryColor,
  ...props
}: NetworkRuralIconProps) {
  const secondary = secondaryColor || color;
  
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <G stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        {/* Pessoa central (principal) */}
        <Circle cx="12" cy="7" r="3" fill={color} opacity={0.2} />
        <Circle cx="12" cy="7" r="3" />
        
        {/* Corpo da pessoa central */}
        <Path d="M12 10v2" />
        
        {/* Pessoa esquerda */}
        <Circle cx="5" cy="9" r="2" fill={secondary} opacity={0.15} />
        <Circle cx="5" cy="9" r="2" />
        
        {/* Pessoa direita */}
        <Circle cx="19" cy="9" r="2" fill={secondary} opacity={0.15} />
        <Circle cx="19" cy="9" r="2" />
        
        {/* Linhas de conexão */}
        <Line x1="7" y1="9" x2="10" y2="8" opacity={0.7} />
        <Line x1="17" y1="9" x2="14" y2="8" opacity={0.7} />
        
        {/* Planta/Crescimento (elemento agro) */}
        <Path 
          d="M12 12v6" 
          strokeWidth={2}
        />
        <Path 
          d="M12 14c-2 0-3-1.5-3-3" 
          fill="none"
        />
        <Path 
          d="M12 14c2 0 3-1.5 3-3" 
          fill="none"
        />
        <Path 
          d="M12 16c-1.5 0-2.5-1-2.5-2" 
          fill="none"
        />
        <Path 
          d="M12 16c1.5 0 2.5-1 2.5-2" 
          fill="none"
        />
        
        {/* Base/Solo */}
        <Path 
          d="M8 21h8" 
          strokeWidth={2}
          opacity={0.5}
        />
        <Circle cx="12" cy="18" r="0.5" fill={color} />
      </G>
    </Svg>
  );
}

/**
 * Ícone de selo Network Ativo
 * Badge que aparece nos perfis com Network Rural ativo
 */
export function NetworkActiveBadgeIcon({
  size = 20,
  color = '#2ECC71',
  ...props
}: NetworkRuralIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <G>
        {/* Círculo de fundo */}
        <Circle cx="12" cy="12" r="10" fill={color} opacity={0.2} />
        <Circle 
          cx="12" 
          cy="12" 
          r="10" 
          stroke={color} 
          strokeWidth={2}
          fill="none"
        />
        
        {/* Ícone de planta/broto */}
        <Path
          d="M12 7v10"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <Path
          d="M12 10c-2.5 0-4-2-4-4 2.5 0 4 2 4 4z"
          fill={color}
          opacity={0.6}
        />
        <Path
          d="M12 10c2.5 0 4-2 4-4-2.5 0-4 2-4 4z"
          fill={color}
          opacity={0.6}
        />
        <Path
          d="M12 14c-2 0-3-1.5-3-3 2 0 3 1.5 3 3z"
          fill={color}
          opacity={0.8}
        />
        <Path
          d="M12 14c2 0 3-1.5 3-3-2 0-3 1.5-3 3z"
          fill={color}
          opacity={0.8}
        />
      </G>
    </Svg>
  );
}

/**
 * Ícone de LinkedIn simplificado
 */
export function LinkedInIcon({
  size = 24,
  color = '#0A66C2',
  ...props
}: NetworkRuralIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      {...props}
    >
      <Path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </Svg>
  );
}
