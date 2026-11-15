export type Category = 'Grammaire' | 'Conjugaison' | 'Orthographe';

export type QcmExercise = {
  type: 'qcm';
  /** Phrase avec « ___ » à l'emplacement du mot manquant. */
  sentence: string;
  options: string[];
  answer: string;
  explanation: string;
};

export type GapExercise = {
  type: 'trous';
  sentence: string;
  hint: string;
  answers: string[];
  explanation: string;
};

export type FixExercise = {
  type: 'correction';
  sentence: string;
  answers: string[];
  explanation: string;
};

export type RephraseExercise = {
  type: 'reformulation';
  sentence: string;
  /** Tournures attendues : au moins deux doivent figurer dans la réponse. */
  keywords: string[];
  model: string;
};

export type Exercise = QcmExercise | GapExercise | FixExercise | RephraseExercise;

export type Lesson = {
  id: string;
  category: Category;
  minutes: number;
  /** Titre en deux temps : partie grisée puis partie accentuée. */
  titleLead: string;
  titleMain: string;
  rule: string;
  /** Mot de la règle à surligner. */
  highlight: string;
  examples: { tag: string; sentence: string; note: string; positive: boolean }[];
  tip: string;
  exercises: [QcmExercise, GapExercise, FixExercise, RephraseExercise];
};

export type Expression = {
  id: string;
  term: string;
  nature: string;
  definition: string;
  example: string;
};
