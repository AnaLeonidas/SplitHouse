import React from 'react';
import Svg, { Path, Polyline } from 'react-native-svg';
import { Colors } from '../constants/theme';

/**
 * Propriedades de customização visual do logotipo vetorial SplitHouse.
 */
interface SplitHouseLogoProps {
  /** Dimensão em pixels (largura e altura) do ícone */
  size?: number;
  /** Espessura do traço vetorial */
  strokeWidth?: number;
  /** Cor do contorno da casa */
  houseColor?: string;
  /** Cor da linha tracejada divisória central */
  splitColor?: string;
}

/**
 * Componente vetorial SVG representando a logo oficial do SplitHouse.
 * Exibe a silhueta de uma moradia com traço central pontilhado, simbolizando a divisão harmoniosa da casa.
 *
 * @param props Configurações de dimensão e paleta do ícone.
 */
export const SplitHouseLogo: React.FC<SplitHouseLogoProps> = ({
  size = 56,
  strokeWidth = 2.1,
  houseColor = Colors.white,
  splitColor = Colors.secondary,
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={houseColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <Path
        d="M12 2v20"
        stroke={splitColor}
        strokeWidth={2}
        strokeDasharray="2, 2"
      />
      <Polyline points="9 22 9 12 15 12 15 22" />
    </Svg>
  );
};

