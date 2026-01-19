import React from 'react';
import Svg, { Circle, G, Line, Path, Polygon } from 'react-native-svg';

interface MatchIconProps {
  size?: number;
  color?: string;
}

export function MatchIcon({ size = 48, color = '#E74C3C' }: MatchIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <G>
        {/* Coração esquerdo */}
        <Path
          d="M 30 35 C 30 28 35 23 41 23 C 45 23 48 25 50 28 C 52 25 55 23 59 23 C 65 23 70 28 70 35 C 70 45 50 60 50 60 C 50 60 30 45 30 35 Z"
          fill={color}
          opacity="0.9"
        />
        
        {/* Brilho no coração */}
        <Circle cx="42" cy="30" r="4" fill="#FFF" opacity="0.6" />
        
        {/* Chapéu de cowboy esquerdo (menor) */}
        <G transform="translate(20, 10)">
          {/* Aba do chapéu */}
          <Path
            d="M 5 18 Q 10 16 15 18"
            stroke="#8B4513"
            strokeWidth="2.5"
            fill="none"
          />
          {/* Copa do chapéu */}
          <Path
            d="M 7 18 L 8 12 Q 10 10 12 12 L 13 18"
            fill="#A0522D"
          />
          {/* Vinco central */}
          <Line x1="10" y1="11" x2="10" y2="17" stroke="#8B4513" strokeWidth="0.8" />
        </G>

        {/* Chapéu de cowboy direito (menor) */}
        <G transform="translate(65, 10)">
          {/* Aba do chapéu */}
          <Path
            d="M 5 18 Q 10 16 15 18"
            stroke="#8B4513"
            strokeWidth="2.5"
            fill="none"
          />
          {/* Copa do chapéu */}
          <Path
            d="M 7 18 L 8 12 Q 10 10 12 12 L 13 18"
            fill="#A0522D"
          />
          {/* Vinco central */}
          <Line x1="10" y1="11" x2="10" y2="17" stroke="#8B4513" strokeWidth="0.8" />
        </G>

        {/* Estrelas ao redor do coração */}
        <G>
          {/* Estrela superior esquerda */}
          <Polygon
            points="25,20 26,23 29,23 26.5,25 27.5,28 25,26 22.5,28 23.5,25 21,23 24,23"
            fill="#FFD700"
          />
          
          {/* Estrela superior direita */}
          <Polygon
            points="75,20 76,23 79,23 76.5,25 77.5,28 75,26 72.5,28 73.5,25 71,23 74,23"
            fill="#FFD700"
          />
          
          {/* Estrela inferior */}
          <Polygon
            points="50,65 51,68 54,68 51.5,70 52.5,73 50,71 47.5,73 48.5,70 46,68 49,68"
            fill="#FFD700"
          />
        </G>

        {/* Círculos decorativos (confete) */}
        <Circle cx="18" cy="40" r="2.5" fill="#FF6B9D" opacity="0.7" />
        <Circle cx="82" cy="40" r="2.5" fill="#4ECDC4" opacity="0.7" />
        <Circle cx="35" cy="55" r="2" fill="#FFD700" opacity="0.7" />
        <Circle cx="65" cy="55" r="2" fill="#FF6B9D" opacity="0.7" />

        {/* Texto "MATCH" estilizado */}
        <G transform="translate(28, 75)">
          <Path
            d="M 0 0 L 2 -2 L 4 0 L 6 -2 L 8 0"
            stroke={color}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d="M 10 0 L 12 -3 L 14 0"
            stroke={color}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d="M 16 0 L 16 -3 L 20 -3"
            stroke={color}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d="M 22 0 L 22 -3 L 26 -3 L 26 0"
            stroke={color}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d="M 28 0 L 30 -3 L 32 0"
            stroke={color}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d="M 34 0 L 34 -3 L 38 -3"
            stroke={color}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </G>
      </G>
    </Svg>
  );
}
