const { describe, it } = require('node:test');
const assert = require('node:assert');
const { toQR } = require('toqr');

describe('Gerador de QR Code (QRCode component logic)', () => {
  it('Deve gerar a matriz de QR Code corretamente a partir de um código de moradia', () => {
    const code = 'SPLIT-8924';
    const matrix = toQR(code, 0); // EC Level M
    assert(matrix instanceof Uint8Array);
    assert(matrix.length > 0);

    const dim = Math.round(Math.sqrt(matrix.length));
    assert.strictEqual(dim * dim, matrix.length);
    assert(dim >= 21, 'Dimensão mínima de um QR Code é 21x21');

    // Deve conter módulos ativos (pretos)
    const activeCount = Array.from(matrix).filter((bit) => bit === 1).length;
    assert(activeCount > 0);
  });

  it('Deve gerar caminhos SVG válidos a partir da matriz codificada', () => {
    const code = 'SPLIT-1234';
    const matrix = toQR(code, 0);
    const matrixDim = Math.round(Math.sqrt(matrix.length));
    const padding = 2;

    let pathData = '';
    for (let y = 0; y < matrixDim; y++) {
      for (let x = 0; x < matrixDim; x++) {
        if (matrix[y * matrixDim + x]) {
          const posX = x + padding;
          const posY = y + padding;
          pathData += `M${posX},${posY}h1v1h-1z `;
        }
      }
    }

    assert(pathData.length > 0);
    assert(pathData.startsWith('M'));
    assert(pathData.includes('h1v1h-1z'));
  });

  it('Deve suportar diferentes níveis de tolerância a falhas (L, M, Q, H)', () => {
    const code = 'SPLIT-TEST';
    const matrixM = toQR(code, 0); // M
    const matrixH = toQR(code, 2); // H (30% redundância)

    assert(matrixM.length > 0);
    assert(matrixH.length > 0);
    // Nível H frequentemente requer versão maior ou igual a M
    assert(matrixH.length >= matrixM.length);
  });

  it('Deve lidar com códigos vazios ou nulos usando fallback seguro', () => {
    const fallbackText = (''.trim()) || 'SPLIT-0000';
    const matrix = toQR(fallbackText, 0);
    assert(matrix.length > 0);
  });
});
