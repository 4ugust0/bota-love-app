import React from 'react';
import Svg, { G, Line, Path, Rect } from 'react-native-svg';

interface PorteiraIconProps {
  size?: number;
  color?: string;
  open?: boolean;
}

export function PorteiraIcon({ size = 60, color = '#27AE60', open = false }: PorteiraIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {open ? (
        // Porteira Aberta (Curtir)
        <G>
          {/* Poste Esquerdo */}
          <Rect x="10" y="20" width="8" height="60" fill={color} />
          
          {/* Porteira Aberta (inclinada para dentro) */}
          <G transform="translate(18, 30) rotate(-30)">
            <Rect x="0" y="0" width="35" height="6" fill={color} opacity="0.9" />
            <Rect x="0" y="12" width="35" height="6" fill={color} opacity="0.9" />
            <Rect x="0" y="24" width="35" height="6" fill={color} opacity="0.9" />
            <Rect x="0" y="36" width="35" height="6" fill={color} opacity="0.9" />
            {/* Vertical */}
            <Rect x="0" y="0" width="4" height="42" fill={color} />
            <Rect x="31" y="0" width="4" height="42" fill={color} />
          </G>
          
          {/* Símbolo de Entrada (seta para dentro) */}
          <Path 
            d="M 65 45 L 80 50 L 65 55 Z" 
            fill={color}
            opacity="0.8"
          />
          <Line x1="50" y1="50" x2="80" y2="50" stroke={color} strokeWidth="3" opacity="0.8" />
        </G>
      ) : (
        // Porteira Fechada (Rejeitar)
        <G>
          {/* Poste Esquerdo */}
          <Rect x="10" y="20" width="8" height="60" fill={color} />
          
          {/* Poste Direito */}
          <Rect x="82" y="20" width="8" height="60" fill={color} />
          
          {/* Travessas Horizontais */}
          <Rect x="18" y="30" width="64" height="6" fill={color} opacity="0.9" />
          <Rect x="18" y="44" width="64" height="6" fill={color} opacity="0.9" />
          <Rect x="18" y="58" width="64" height="6" fill={color} opacity="0.9" />
          <Rect x="18" y="72" width="64" height="6" fill={color} opacity="0.9" />
          
          {/* Travessas Verticais */}
          <Rect x="40" y="30" width="4" height="48" fill={color} />
          <Rect x="60" y="30" width="4" height="48" fill={color} />
          
          {/* X de fechado */}
          <Line x1="25" y1="35" x2="75" y2="73" stroke={color} strokeWidth="4" opacity="0.6" />
          <Line x1="75" y1="35" x2="25" y2="73" stroke={color} strokeWidth="4" opacity="0.6" />
        </G>
      )}
    </Svg>
  );
}
