import React from 'react';
import Svg, { Circle, G, Path } from 'react-native-svg';

interface FogueiraIconProps {
  size?: number;
  color?: string;
  animated?: boolean;
}

export function FogueiraIcon({ size = 70, color = '#FF6B35', animated = false }: FogueiraIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <G>
        {/* Lenha base */}
        <G>
          {/* Tora 1 */}
          <Path
            d="M 20 75 L 45 65 L 45 70 L 20 80 Z"
            fill="#8B4513"
          />
          {/* Tora 2 */}
          <Path
            d="M 80 75 L 55 65 L 55 70 L 80 80 Z"
            fill="#654321"
          />
          {/* Tora 3 (central) */}
          <Path
            d="M 35 70 L 65 70 L 65 75 L 35 75 Z"
            fill="#A0522D"
          />
        </G>

        {/* Fogo - Chama Principal (gradiente simulado com layers) */}
        <G>
          {/* Camada externa - laranja escuro */}
          <Path
            d="M 50 65 Q 35 55 38 40 Q 40 30 45 28 Q 48 35 50 30 Q 52 35 55 28 Q 60 30 62 40 Q 65 55 50 65 Z"
            fill="#FF6B35"
            opacity="0.9"
          />
          
          {/* Camada média - laranja */}
          <Path
            d="M 50 62 Q 38 53 40 42 Q 42 34 46 33 Q 48 38 50 35 Q 52 38 54 33 Q 58 34 60 42 Q 62 53 50 62 Z"
            fill="#FF8C42"
            opacity="0.8"
          />
          
          {/* Camada interna - amarelo */}
          <Path
            d="M 50 58 Q 42 50 43 43 Q 44 38 47 37 Q 48 40 50 38 Q 52 40 53 37 Q 56 38 57 43 Q 58 50 50 58 Z"
            fill="#FFD700"
            opacity="0.9"
          />
          
          {/* Centro - branco quente */}
          <Path
            d="M 50 54 Q 45 48 46 44 Q 47 41 50 42 Q 53 41 54 44 Q 55 48 50 54 Z"
            fill="#FFF8DC"
            opacity="0.7"
          />
        </G>

        {/* Chamas laterais menores */}
        <G>
          {/* Chama esquerda */}
          <Path
            d="M 40 50 Q 35 45 36 38 Q 37 34 40 36 Q 42 40 40 50 Z"
            fill="#FF8C42"
            opacity="0.7"
          />
          
          {/* Chama direita */}
          <Path
            d="M 60 50 Q 65 45 64 38 Q 63 34 60 36 Q 58 40 60 50 Z"
            fill="#FF8C42"
            opacity="0.7"
          />
        </G>

        {/* Faíscas/Estrelas */}
        <Circle cx="38" cy="25" r="2" fill="#FFD700" opacity="0.8" />
        <Circle cx="62" cy="25" r="2" fill="#FFD700" opacity="0.8" />
        <Circle cx="50" cy="18" r="2.5" fill="#FFF" opacity="0.9" />
        <Circle cx="45" cy="22" r="1.5" fill="#FFD700" opacity="0.7" />
        <Circle cx="55" cy="22" r="1.5" fill="#FFD700" opacity="0.7" />

        {/* Brilhos adicionais */}
        <Path
          d="M 50 20 L 50.5 23 L 49.5 23 Z"
          fill="#FFF"
          opacity="0.6"
        />
        <Path
          d="M 50 20 L 52 21 L 48 21 Z"
          fill="#FFF"
          opacity="0.5"
        />
      </G>
    </Svg>
  );
}
