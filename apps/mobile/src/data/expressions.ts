export type Expression = {
  id: string;
  term: string;
  nature: string;
  definition: string;
  example: string;
};

export const expressions: Expression[] = [
  { id: 'nonobstant', term: 'Nonobstant', nature: 'préposition', definition: 'En dépit de, malgré.', example: 'Nonobstant la pluie, la cérémonie eut lieu.' },
  { id: 'a-l-instar-de', term: "À l'instar de", nature: 'locution prépositive', definition: "À la manière de, à l'exemple de.", example: "À l'instar de ses aînés, elle choisit le droit." },
  { id: 'au-demeurant', term: 'Au demeurant', nature: 'locution adverbiale', definition: 'Du reste, tout bien considéré.', example: "C'est un homme sévère, au demeurant fort aimable." },
  { id: 'derechef', term: 'Derechef', nature: 'adverbe', definition: 'De nouveau, une seconde fois.', example: 'Il frappa derechef à la porte.' },
  { id: 'de-surcroit', term: 'De surcroît', nature: 'locution adverbiale', definition: 'En outre, de plus.', example: 'Le projet est ambitieux et, de surcroît, peu coûteux.' },
  { id: 'eu-egard-a', term: 'Eu égard à', nature: 'locution prépositive', definition: 'En considération de, compte tenu de.', example: 'Eu égard à son expérience, le poste lui fut confié.' },
  { id: 'subsequemment', term: 'Subséquemment', nature: 'adverbe', definition: 'Par la suite, en conséquence.', example: 'Le contrat fut signé et, subséquemment, les travaux débutèrent.' },
];

export function expressionOfDay(index: number): Expression {
  return expressions[((index % expressions.length) + expressions.length) % expressions.length];
}
