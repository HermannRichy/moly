import type { Exercise } from '@/data/lessons';

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[’`´]/g, "'")
    .replace(/[.!?…]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isCorrect(exercise: Exercise, answer: string): boolean {
  const given = normalize(answer);
  if (!given) return false;
  switch (exercise.type) {
    case 'qcm':
      return given === normalize(exercise.answer);
    case 'trous':
    case 'correction':
      return exercise.answers.some((expected) => normalize(expected) === given);
    case 'reformulation': {
      const hits = exercise.keywords.filter((keyword) => given.includes(normalize(keyword)));
      return hits.length >= 2;
    }
  }
}
