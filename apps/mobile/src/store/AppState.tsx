import { useAuth, useUser } from '@clerk/expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { type Expression, expressions as bundledExpressions } from '@/data/expressions';
import { type Lesson, lessons as bundledLessons } from '@/data/lessons';
import { api, apiEnabled, ApiRejected } from '@/lib/api';
import { dayKey, previousDayKey } from '@/lib/dates';
import { XP_PER_ANSWER } from '@/lib/levels';

export type Pace = 'express' | 'complet';

export type AppData = {
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

/** État renvoyé par l'API. */
type ServerState = Omit<AppData, 'userName'> & { name: string };

type ProfilePatch = Partial<Pick<AppData, 'onboarded' | 'reminderMinutes' | 'pace'>> & { name?: string };

/** Opération en attente d'envoi, conservée tant que le réseau manque. */
type PendingOp =
  | { kind: 'complete'; lessonId: string; correct: number; total: number; day: string }
  | { kind: 'save'; expressionId: string; saved: boolean }
  | { kind: 'profile'; patch: ProfilePatch };

const INITIAL: AppData = {
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

export function nextLesson(data: AppData, lessons: Lesson[]): Lesson {
  return lessons.find((lesson) => !data.completed.includes(lesson.id)) ?? lessons[data.completed.length % lessons.length];
}

type AppContextValue = {
  ready: boolean;
  /** Vrai une fois la première synchronisation du compte tentée. */
  synced: boolean;
  data: AppData;
  lessons: Lesson[];
  expressions: Expression[];
  update: (patch: Partial<Pick<AppData, 'onboarded' | 'reminderMinutes' | 'pace'>>) => void;
  completeLesson: (lessonId: string, correct: number, total: number) => LessonOutcome;
  toggleExpression: (id: string) => void;
};

const STATE_KEY = 'moly.state.v2';
const QUEUE_KEY = 'moly.queue.v1';
const CONTENT_KEY = 'moly.content.v1';
const AppContext = createContext<AppContextValue | null>(null);

function save(key: string, value: unknown) {
  AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [data, setData] = useState<AppData>(INITIAL);
  const [content, setContent] = useState({ lessons: bundledLessons, expressions: bundledExpressions });
  const [ready, setReady] = useState(false);
  const [synced, setSynced] = useState(!apiEnabled);

  const dataRef = useRef(data);
  const queueRef = useRef<PendingOp[]>([]);
  const flushing = useRef(false);
  // Clerk peut renvoyer une nouvelle fonction à chaque rendu : on la garde dans une référence
  // pour que la synchronisation ne se relance pas en boucle.
  const getTokenRef = useRef(getToken);
  useEffect(() => {
    getTokenRef.current = getToken;
  });

  const persist = useCallback((next: AppData) => {
    dataRef.current = next;
    setData(next);
    save(STATE_KEY, next);
  }, []);

  // Chargement de l'état local et du contenu en cache.
  useEffect(() => {
    (async () => {
      try {
        const [state, queue, cached] = await Promise.all([
          AsyncStorage.getItem(STATE_KEY),
          AsyncStorage.getItem(QUEUE_KEY),
          AsyncStorage.getItem(CONTENT_KEY),
        ]);
        if (state) {
          dataRef.current = { ...INITIAL, ...(JSON.parse(state) as Partial<AppData>) };
          setData(dataRef.current);
        }
        if (queue) queueRef.current = JSON.parse(queue) as PendingOp[];
        if (cached) {
          const parsed = JSON.parse(cached) as { lessons: Lesson[]; expressions: Expression[] };
          if (parsed.lessons?.length && parsed.expressions?.length) setContent(parsed);
        }
      } catch {
        // État local illisible : on repart des valeurs par défaut.
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const applyServer = useCallback(
    (state: ServerState) => {
      const { name, ...rest } = state;
      persist({ ...dataRef.current, ...rest, pace: rest.pace === 'express' ? 'express' : 'complet', userName: name || dataRef.current.userName });
    },
    [persist],
  );

  /** Envoie les opérations en attente, dans l'ordre. S'arrête au premier échec réseau. */
  const flush = useCallback(async () => {
    if (!apiEnabled || flushing.current) return;
    flushing.current = true;
    try {
      while (queueRef.current.length > 0) {
        const op = queueRef.current[0];
        const token = await getTokenRef.current();
        if (!token) return;
        try {
          let state: ServerState;
          if (op.kind === 'complete') {
            const result = await api<{ state: ServerState }>(`/v1/lessons/${encodeURIComponent(op.lessonId)}/complete`, {
              method: 'POST',
              token,
              body: { correct: op.correct, total: op.total, day: op.day },
            });
            state = result.state;
          } else if (op.kind === 'save') {
            state = await api<ServerState>(`/v1/expressions/${encodeURIComponent(op.expressionId)}/saved`, {
              method: 'PUT',
              token,
              body: { saved: op.saved },
            });
          } else {
            state = await api<ServerState>('/v1/me', { method: 'PATCH', token, body: op.patch });
          }
          queueRef.current = queueRef.current.slice(1);
          save(QUEUE_KEY, queueRef.current);
          if (queueRef.current.length === 0) applyServer(state);
        } catch (error) {
          if (!(error instanceof ApiRejected)) return;
          queueRef.current = queueRef.current.slice(1);
          save(QUEUE_KEY, queueRef.current);
        }
      }
    } finally {
      flushing.current = false;
    }
  }, [applyServer]);

  const enqueue = useCallback(
    (op: PendingOp) => {
      if (!apiEnabled) return;
      queueRef.current = [...queueRef.current, op];
      save(QUEUE_KEY, queueRef.current);
      void flush();
    },
    [flush],
  );

  // Synchronisation du compte à la connexion ; remise à zéro à la déconnexion.
  const firstName = user?.firstName ?? '';
  useEffect(() => {
    if (!ready || !isLoaded) return;
    if (!isSignedIn) {
      queueRef.current = [];
      save(QUEUE_KEY, []);
      if (apiEnabled) {
        persist(INITIAL);
        setContent({ lessons: bundledLessons, expressions: bundledExpressions });
        AsyncStorage.removeItem(CONTENT_KEY).catch(() => {});
      }
      setSynced(!apiEnabled);
      return;
    }
    if (firstName && firstName !== dataRef.current.userName) persist({ ...dataRef.current, userName: firstName });
    if (!apiEnabled) return;
    let cancelled = false;
    (async () => {
      try {
        await flush();
        if (queueRef.current.length > 0) return;
        const token = await getTokenRef.current();
        if (!token) return;
        const server = await api<ServerState>('/v1/me', { token });
        if (cancelled) return;
        const local = dataRef.current;
        const patch: ProfilePatch = {};
        if (firstName && server.name !== firstName) patch.name = firstName;
        if (!server.onboarded && local.onboarded) {
          patch.onboarded = true;
          patch.reminderMinutes = local.reminderMinutes;
          patch.pace = local.pace;
        }
        applyServer({ ...server, ...patch, name: patch.name ?? server.name });
        if (Object.keys(patch).length > 0) enqueue({ kind: 'profile', patch });
        // Les leçons sont réservées aux comptes connectés : on les charge avec la session.
        const fresh = await api<{ lessons: Lesson[]; expressions: Expression[] }>('/v1/content', { token });
        if (!cancelled && fresh.lessons?.length && fresh.expressions?.length) {
          const next = { lessons: fresh.lessons, expressions: fresh.expressions };
          setContent(next);
          save(CONTENT_KEY, next);
        }
      } catch {
        // Hors ligne : on garde l'état local, la synchronisation reprendra au prochain lancement.
      } finally {
        if (!cancelled) setSynced(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, isLoaded, isSignedIn, firstName, flush, applyServer, enqueue, persist]);

  const value = useMemo<AppContextValue>(() => {
    return {
      ready,
      synced,
      data,
      lessons: content.lessons,
      expressions: content.expressions,
      update: (patch) => {
        persist({ ...dataRef.current, ...patch });
        enqueue({ kind: 'profile', patch });
      },
      completeLesson: (lessonId, correct, total) => {
        const current = dataRef.current;
        const today = dayKey();
        const streak =
          current.lastLessonDay === today ? Math.max(current.streak, 1) : current.lastLessonDay === previousDayKey() ? current.streak + 1 : 1;
        const xpGained = correct * XP_PER_ANSWER;
        const isPerfect = correct === total;
        const next: AppData = {
          ...current,
          streak,
          lastLessonDay: today,
          xp: current.xp + xpGained,
          completed: current.completed.includes(lessonId) ? current.completed : [...current.completed, lessonId],
          perfect: isPerfect && !current.perfect.includes(lessonId) ? [...current.perfect, lessonId] : current.perfect,
          toReview: isPerfect
            ? current.toReview.filter((id) => id !== lessonId)
            : current.toReview.includes(lessonId)
              ? current.toReview
              : [...current.toReview, lessonId],
        };
        const before = earnedBadges(current);
        const newBadges = earnedBadges(next)
          .filter((id) => !before.includes(id))
          .map((id) => BADGES.find((badge) => badge.id === id)!.name);
        persist(next);
        enqueue({ kind: 'complete', lessonId, correct, total, day: today });
        return { correct, total, xpGained, streak, newBadges };
      },
      toggleExpression: (id) => {
        const current = dataRef.current;
        const saved = !current.savedExpressions.includes(id);
        persist({
          ...current,
          savedExpressions: saved ? [...current.savedExpressions, id] : current.savedExpressions.filter((item) => item !== id),
        });
        enqueue({ kind: 'save', expressionId: id, saved });
      },
    };
  }, [data, ready, synced, content, persist, enqueue]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp doit être utilisé dans AppStateProvider');
  return ctx;
}
