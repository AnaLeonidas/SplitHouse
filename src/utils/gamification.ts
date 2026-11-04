/**
 * Utilitários para o sistema de gamificação do SplitHouse.
 * Centraliza o cálculo consistente de níveis, títulos de honra e pontuação de XP.
 */

/**
 * Calcula o nível do morador a partir do total de pontos de experiência (XP).
 * Cada nível requer 100 pontos de XP.
 * 
 * Nível 1: 0 - 99 XP
 * Nível 2: 100 - 199 XP
 * Nível 3: 200 - 299 XP
 * Nível 4: 300 - 399 XP
 * Nível 5+: 400+ XP
 *
 * @param xp Pontuação de experiência acumulada.
 * @returns Nível inteiro (mínimo 1).
 */
export function calculateLevel(xp: number): number {
  if (!xp || xp < 0) return 1;
  return Math.max(1, Math.floor(xp / 100) + 1);
}

/**
 * Retorna o título de honra oficial associado ao nível de gamificação.
 *
 * @param level Nível do morador.
 * @returns Título honorífico em português.
 */
export function calculateTitle(level: number): string {
  if (level <= 1) return 'Morador Iniciante';
  if (level === 2) return 'Morador Ativo';
  if (level === 3) return 'Morador Dedicado';
  if (level === 4) return 'Morador Exemplar';
  return 'Morador Mestre';
}

/**
 * Retorna os detalhes consolidados de nível, título e próximo marco de XP.
 *
 * @param xp Pontuação de experiência.
 */
export function calculateLevelAndTitle(xp: number): {
  level: number;
  title: string;
  nextLevelXp: number;
  currentLevelXp: number;
} {
  const safeXp = Math.max(0, xp || 0);
  const level = calculateLevel(safeXp);
  const title = calculateTitle(level);
  const nextLevelXp = level * 100;
  const currentLevelXp = safeXp % 100;

  return {
    level,
    title,
    nextLevelXp,
    currentLevelXp,
  };
}

