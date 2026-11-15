/** Le parcours est découpé en actes de six scènes, dans l'ordre des leçons. */
export const SCENES_PER_ACT = 6;

export const ACT_NAMES = ['Les fondations', 'Les accords', 'Les modes et les temps', 'Les pièges', 'Le beau style'];

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

export function actTitle(index: number): { numeral: string; name: string } {
  return { numeral: ROMAN[index] ?? String(index + 1), name: ACT_NAMES[index] ?? 'Suite du parcours' };
}
