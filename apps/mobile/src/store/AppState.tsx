import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { lessons } from '@/data/lessons';
import { dayKey, previousDayKey } from '@/lib/dates';
import { XP_PER_ANSWER } from '@/lib/levels';

export type Pace = 'express' | 'complet';

export type AppData = {
  signedIn: boolean;
  userName: string;
  onboarded: boolean;
  reminderMinutes: number;
  pace: Pace;
  streak: number;
  lastLessonDay: string | null;
  xp: number;
  completed: string[];
  perfect: string[];
  toReview: string[];
  savedExpressions: string[];
};

export type LessonOutcome = {
  correct: number;
  total: number;
  xpGained: number;
  streak: number;
  newBadges: string[];
};

const INITIAL: AppData = {
  signedIn: false,
  userName: '',
  onboarded: false,
  reminderMinutes: 7 * 60 + 30,
  pace: 'complet',
  streak: 0,
  lastLessonDay: null,
  xp: 0,
  completed: [],
  perfect: [],
  toReview: [],
  savedExpressions: [],
};

export type BadgeId = 'premiere-lecon' | 'sans-faute' | 'sept-jours' | 'trente-jours';

export const BADGES: { id: BadgeId; name: string }[] = [
  { id: 'premiere-lecon', name: 'Première leçon' },
  { id: 'sans-faute', name: 'Sans faute' },
  { id: 'sept-jours', name: "7 jours d'affilée" },
  { id: 'trente-jours', name: "30 jours d'affilée" },
];

export function earnedBadges(data: AppData): BadgeId[] {
  const out: BadgeId[] = [];
  if (data.completed.length >= 1) out.push('premiere-lecon');
  if (data.perfect.length >= 1) out.push('sans-faute');
  if (data.streak >= 7) out.push('sept-jours');
  if (data.streak >= 30) out.push('trente-jours');
  return out;
}

/** Série affichée : elle retombe à zéro si la dernière leçon date d'avant-hier ou plus. */
export function currentStreak(data: AppData): number {
  if (!data.lastLessonDay) return 0;
  if (data.lastLessonDay === dayKey() || data.lastLessonDay === previousDayKey()) return data.streak;
  return 0;
}

export function nextLessonId(data: AppData): string {
  const next = lessons.find((lesson) => !data.completed.includes(lesson.id));
  return (next ?? lessons[data.completed.length % lessons.length]).id;
}

type AppContextValue = {
  ready: boolean;
  data: AppData;
  update: (patch: Partial<AppData>) => void;
  completeLesson: (lessonId: string, correct: number, total: number) => LessonOutcome;
  toggleExpression: (id: string) => void;
  signOut: () => void;
};

const KEY = 'moly.state.v1';
const AppContext = createContext<AppContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(INITIAL);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) setData({ ...INITIAL, ...(JSON.parse(raw) as Partial<AppData>) });
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const persist = useCallback((next: AppData) => {
    setData(next);
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const value = useMemo<AppContextValue>(() => {
    return {
      ready,
      data,
      update: (patch) => persist({ ...data, ...patch }),
      completeLesson: (lessonId, correct, total) => {
        const today = dayKey();
        const streak =
          data.lastLessonDay === today ? Math.max(data.streak, 1) : data.lastLessonDay === previousDayKey() ? data.streak + 1 : 1;
        const xpGained = correct * XP_PER_ANSWER;
        const isPerfect = correct === total;
        const next: AppData = {
          ...data,
          streak,
          lastLessonDay: today,
          xp: data.xp + xpGained,
          completed: data.completed.includes(lessonId) ? data.completed : [...data.completed, lessonId],
          perfect: isPerfect && !data.perfect.includes(lessonId) ? [...data.perfect, lessonId] : data.perfect,
          toReview: isPerfect
            ? data.toReview.filter((id) => id !== lessonId)
            : data.toReview.includes(lessonId)
              ? data.toReview
              : [...data.toReview, lessonId],
        };
        const before = earnedBadges(data);
        const newBadges = earnedBadges(next)
          .filter((id) => !before.includes(id))
          .map((id) => BADGES.find((badge) => badge.id === id)!.name);
        persist(next);
        return { correct, total, xpGained, streak, newBadges };
      },
      toggleExpression: (id) =>
        persist({
          ...data,
          savedExpressions: data.savedExpressions.includes(id)
            ? data.savedExpressions.filter((saved) => saved !== id)
            : [...data.savedExpressions, id],
        }),
      signOut: () => persist({ ...data, signedIn: false }),
    };
  }, [data, ready, persist]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp doit être utilisé dans AppStateProvider');
  return ctx;
}
