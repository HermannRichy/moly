export const XP_PER_ANSWER = 10;

const DAY = /^\d{4}-\d{2}-\d{2}$/;

function toUtc(day: string): number {
  const [y, m, d] = day.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

/** Le jour envoyé par le téléphone doit être plausible : à un jour près de la date du serveur. */
export function isPlausibleDay(day: string, now: Date = new Date()): boolean {
  if (!DAY.test(day)) return false;
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.abs(toUtc(day) - today) <= 86_400_000;
}

export function previousDay(day: string): string {
  return new Date(toUtc(day) - 86_400_000).toISOString().slice(0, 10);
}

export function nextStreak(streak: number, lastLessonDay: string | null, day: string): number {
  if (lastLessonDay === day) return Math.max(streak, 1);
  if (lastLessonDay === previousDay(day)) return streak + 1;
  return 1;
}

export type BadgeId = 'premiere-lecon' | 'sans-faute' | 'sept-jours' | 'trente-jours';

export function badgesOf(input: { completed: number; perfect: number; streak: number }): BadgeId[] {
  const out: BadgeId[] = [];
  if (input.completed >= 1) out.push('premiere-lecon');
  if (input.perfect >= 1) out.push('sans-faute');
  if (input.streak >= 7) out.push('sept-jours');
  if (input.streak >= 30) out.push('trente-jours');
  return out;
}
