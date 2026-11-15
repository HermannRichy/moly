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

export const lessons: Lesson[] = [
  {
    id: 'participe-passe-avoir',
    category: 'Grammaire',
    minutes: 3,
    titleLead: 'Le participe passé',
    titleMain: 'avec avoir',
    rule: "Avec l'auxiliaire avoir, le participe passé s'accorde avec le complément d'objet direct (COD) lorsque celui-ci est placé avant le verbe.",
    highlight: 'avant',
    examples: [
      { tag: 'Accord', sentence: "Les lettres que j'ai écrites.", note: 'Le COD « que » précède le verbe.', positive: true },
      { tag: "Pas d'accord", sentence: "J'ai écrit des lettres.", note: 'Le COD suit le verbe.', positive: false },
    ],
    tip: 'Posez la question « quoi ? » après le verbe pour trouver le COD.',
    exercises: [
      {
        type: 'qcm',
        sentence: "Les fleurs que tu m'as ___ sont magnifiques.",
        options: ['offert', 'offerte', 'offerts', 'offertes'],
        answer: 'offertes',
        explanation: "« Que », mis pour « les fleurs », précède le verbe : le participe s'accorde au féminin pluriel.",
      },
      {
        type: 'trous',
        sentence: "La lettre que j'ai ___ hier est déjà arrivée.",
        hint: 'envoyer',
        answers: ['envoyée'],
        explanation: "Le COD « que », mis pour « la lettre », est placé avant le verbe : on écrit « envoyée ».",
      },
      {
        type: 'correction',
        sentence: "Les décisions qu'il a pris sont courageuses.",
        answers: ["Les décisions qu'il a prises sont courageuses."],
        explanation: "« Qu' », mis pour « les décisions », précède le verbe : le participe prend la marque du féminin pluriel.",
      },
      {
        type: 'reformulation',
        sentence: 'Je vous envoie ce mail pour vous dire que je ne pourrai pas venir.',
        keywords: ['afin de', 'informer', 'en mesure'],
        model: "Je vous écris afin de vous informer que je ne serai pas en mesure d'être présent.",
      },
    ],
  },
  {
    id: 'bien-que-apres-que',
    category: 'Conjugaison',
    minutes: 3,
    titleLead: 'Bien que',
    titleMain: 'et après que',
    rule: "« Bien que » est toujours suivi du subjonctif. « Après que », qui évoque un fait accompli, est suivi de l'indicatif.",
    highlight: 'subjonctif',
    examples: [
      { tag: 'Subjonctif', sentence: "Bien qu'il soit tard, je poursuis.", note: '« Bien que » exprime une concession.', positive: true },
      { tag: 'Indicatif', sentence: "Après qu'il est parti, nous avons dîné.", note: 'Le fait a réellement eu lieu.', positive: false },
    ],
    tip: 'Ne confondez pas avec « avant que », qui, lui, réclame le subjonctif.',
    exercises: [
      {
        type: 'qcm',
        sentence: "Bien qu'il ___ fatigué, il a terminé son rapport.",
        options: ['est', 'soit', 'était', 'sera'],
        answer: 'soit',
        explanation: '« Bien que » impose le subjonctif : « soit ».',
      },
      {
        type: 'trous',
        sentence: "Après qu'elle ___ son discours, la salle a applaudi.",
        hint: 'finir, au passé composé',
        answers: ['a fini'],
        explanation: "« Après que » se construit avec l'indicatif : « a fini », et non « ait fini ».",
      },
      {
        type: 'correction',
        sentence: "Malgré qu'il pleut, nous sortirons.",
        answers: ["Bien qu'il pleuve, nous sortirons.", "Quoiqu'il pleuve, nous sortirons."],
        explanation: "« Malgré que » est déconseillé dans la langue soignée : préférez « bien que », suivi du subjonctif.",
      },
      {
        type: 'reformulation',
        sentence: "Même si c'est dur, on va y arriver.",
        keywords: ['bien que', 'ardue', 'parviendrons'],
        model: 'Bien que la tâche soit ardue, nous y parviendrons.',
      },
    ],
  },
  {
    id: 'quel-que-quelque',
    category: 'Orthographe',
    minutes: 3,
    titleLead: 'Quelque ou',
    titleMain: 'quel que',
    rule: "« Quel que », en deux mots, précède le verbe être au subjonctif et s'accorde avec le sujet. « Quelque », en un mot, précède un nom ou un adjectif.",
    highlight: 'deux mots',
    examples: [
      { tag: 'Deux mots', sentence: 'Quelle que soit votre décision.', note: "Devant « soit » : accord avec « décision ».", positive: true },
      { tag: 'Un mot', sentence: 'Quelques amis sont venus.', note: 'Devant un nom : déterminant.', positive: false },
    ],
    tip: "Si le mot qui suit est « soit », « soient » ou « fût », écrivez toujours en deux mots.",
    exercises: [
      {
        type: 'qcm',
        sentence: '___ soient vos raisons, prévenez-nous.',
        options: ['Quelque', 'Quelques', 'Quels que', 'Quelles que'],
        answer: 'Quelles que',
        explanation: "Devant « soient », on écrit en deux mots et l'on accorde avec « raisons », féminin pluriel.",
      },
      {
        type: 'trous',
        sentence: 'Il a rencontré ___ difficultés en chemin.',
        hint: 'un petit nombre de',
        answers: ['quelques'],
        explanation: 'Devant un nom pluriel, « quelques » est un déterminant : un seul mot, avec un « s ».',
      },
      {
        type: 'correction',
        sentence: "Quelque soit le prix, je l'achète.",
        answers: ["Quel que soit le prix, je l'achète."],
        explanation: "Devant « soit », on écrit « quel que » en deux mots, accordé avec « prix », masculin singulier.",
      },
      {
        type: 'reformulation',
        sentence: 'Peu importe ce que tu décides, je te suis.',
        keywords: ['quelle que soit', 'décision', 'rallierai'],
        model: "Quelle que soit votre décision, je m'y rallierai.",
      },
    ],
  },
  {
    id: 'leur-leurs',
    category: 'Grammaire',
    minutes: 2,
    titleLead: 'Leur',
    titleMain: 'ou leurs',
    rule: "Placé devant un verbe, « leur » est un pronom invariable. Placé devant un nom, c'est un déterminant qui s'accorde en nombre avec ce nom.",
    highlight: 'invariable',
    examples: [
      { tag: 'Pronom', sentence: 'Je leur parle chaque matin.', note: 'Devant un verbe : jamais de « s ».', positive: true },
      { tag: 'Déterminant', sentence: 'Ils rangent leurs affaires.', note: 'Devant un nom pluriel : « leurs ».', positive: false },
    ],
    tip: 'Remplacez par « lui » : si la phrase reste correcte, « leur » ne prend pas de « s ».',
    exercises: [
      {
        type: 'qcm',
        sentence: 'Je ___ ai expliqué la situation.',
        options: ['leur', 'leurs', 'leurre', "l'heure"],
        answer: 'leur',
        explanation: 'Devant le verbe, « leur » est un pronom : il reste invariable.',
      },
      {
        type: 'trous',
        sentence: 'Les enfants ont oublié ___ cahiers.',
        hint: 'possessif',
        answers: ['leurs'],
        explanation: "Devant le nom pluriel « cahiers », le déterminant s'accorde : « leurs ».",
      },
      {
        type: 'correction',
        sentence: 'Nous leurs avons écrit hier.',
        answers: ['Nous leur avons écrit hier.'],
        explanation: 'Devant « avons écrit », « leur » est un pronom invariable.',
      },
      {
        type: 'reformulation',
        sentence: 'Je leur ai dit merci pour le coup de main.',
        keywords: ['exprimé', 'gratitude', 'concours'],
        model: 'Je leur ai exprimé ma gratitude pour leur précieux concours.',
      },
    ],
  },
  {
    id: 'si-conditionnel',
    category: 'Conjugaison',
    minutes: 3,
    titleLead: 'Après si,',
    titleMain: 'jamais de conditionnel',
    rule: "Après un « si » de condition, on n'emploie jamais le conditionnel : la subordonnée se met à l'imparfait, et le conditionnel passe dans la principale.",
    highlight: 'imparfait',
    examples: [
      { tag: 'Correct', sentence: "Si j'avais le temps, je voyagerais.", note: 'Imparfait, puis conditionnel.', positive: true },
      { tag: 'Fautif', sentence: "Si j'aurais le temps, je voyagerais.", note: 'Le conditionnel suit « si ».', positive: false },
    ],
    tip: 'Retenez la formule : « les si n\'aiment pas les -rais ».',
    exercises: [
      {
        type: 'qcm',
        sentence: "Si tu ___ plus tôt, nous arriverions à l'heure.",
        options: ['partirais', 'partais', 'partiras', 'pars'],
        answer: 'partais',
        explanation: "Après « si », l'imparfait : « partais ». Le conditionnel est réservé à la principale.",
      },
      {
        type: 'trous',
        sentence: "Si j'étais riche, j'___ une maison au bord de la mer.",
        hint: 'acheter',
        answers: ['achèterais'],
        explanation: 'Dans la principale, le conditionnel présent : « achèterais ».',
      },
      {
        type: 'correction',
        sentence: "Si j'aurais su, je serais venu.",
        answers: ["Si j'avais su, je serais venu."],
        explanation: "Après « si », le plus-que-parfait remplace le conditionnel passé : « si j'avais su ».",
      },
      {
        type: 'reformulation',
        sentence: "Si vous pouviez me répondre vite, ça m'arrangerait.",
        keywords: ['saurais gré', 'bien vouloir', 'meilleurs délais'],
        model: 'Je vous saurais gré de bien vouloir me répondre dans les meilleurs délais.',
      },
    ],
  },
];

export function getLesson(id: string): Lesson | undefined {
  return lessons.find((lesson) => lesson.id === id);
}
