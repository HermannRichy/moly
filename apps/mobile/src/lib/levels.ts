export const XP_PER_ANSWER = 10;
export const XP_PER_LEVEL = 200;

const NAMES = ['Apprenti', 'Initié', 'Érudit', 'Lettré', 'Bel esprit', 'Académicien'];

export function levelOf(xp: number) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  return {
    level,
    name: NAMES[Math.min(level, NAMES.length) - 1],
    current: xp % XP_PER_LEVEL,
    needed: XP_PER_LEVEL,
  };
}
