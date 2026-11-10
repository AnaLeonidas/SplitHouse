import React, { useMemo } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Svg, { Rect, Path } from 'react-native-svg';
import { toQR } from 'toqr';

/** Níveis de correção de erro do QR Code (Error Correction Level). */
export type QRErrorCorrectionLevel = 'M' | 'L' | 'H' | 'Q';

const EC_MAP: Record<QRErrorCorrectionLevel, number> = {
  M: 0,
  L: 1,
  H: 2,
  Q: 3,
};

/**
 * Propriedades do componente gerador de QR Code.
 */
export interface QRCodeProps {
  /** Texto ou código alfanumérico a ser codificado no QR Code (ex: 'SPLIT-8924'). */
  value: string;
  /** Dimensão física (largura e altura) do QR Code em pixels (padrão: 160). */
  size?: number;
  /** Cor dos módulos escuros do QR Code (padrão: '#2D2D2A'). */
  color?: string;
  /** Cor de fundo / quiet zone do QR Code (padrão: '#FFFFFF'). */
  backgroundColor?: string;
  /** Quantidade de módulos de borda de segurança / quiet zone (padrão: 2). */
  padding?: number;
  /** Nível de tolerância a falhas e redundância (padrão: 'M'). */
  errorCorrectionLevel?: QRErrorCorrectionLevel;
  /** Estilos adicionais para o container do QR Code. */
  style?: StyleProp<ViewStyle>;
}

/**
 * Componente dinâmico de geração de QR Code vetorial em SVG nativo.
 * Gera a matriz matemática de módulos via algoritmo de codificação ISO/IEC 18004
 * e renderiza um path SVG de alta performance e nitidez em qualquer densidade de tela.
 *
 * @param props Parâmetros de codificação, dimensões e cores do QR Code.
 */
export const QRCode: React.FC<QRCodeProps> = ({
  value,
  size = 160,
  color = '#2D2D2A',
  backgroundColor = '#FFFFFF',
  padding = 2,
  errorCorrectionLevel = 'M',
  style,
}) => {
  const { pathData, viewBoxSize } = useMemo(() => {
    const textToEncode = (value && value.trim()) || 'SPLIT-0000';
    const ecCode = EC_MAP[errorCorrectionLevel] ?? 0;

    try {
      const matrix = toQR(textToEncode, ecCode);
      const matrixDim = Math.round(Math.sqrt(matrix.length));
      const totalDim = matrixDim + padding * 2;

      let d = '';
      for (let y = 0; y < matrixDim; y++) {
        for (let x = 0; x < matrixDim; x++) {
          if (matrix[y * matrixDim + x]) {
            const posX = x + padding;
            const posY = y + padding;
            d += `M${posX},${posY}h1v1h-1z `;
          }
        }
      }

      return {
        pathData: d,
        viewBoxSize: totalDim,
      };
    } catch (err) {
      console.warn('QRCode: Falha ao gerar matriz:', err);
      return { pathData: '', viewBoxSize: 25 };
    }
  }, [value, padding, errorCorrectionLevel]);

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      >
        {backgroundColor && backgroundColor !== 'transparent' && (
          <Rect
            x={0}
            y={0}
            width={viewBoxSize}
            height={viewBoxSize}
            fill={backgroundColor}
          />
        )}
        {pathData ? <Path d={pathData} fill={color} /> : null}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
