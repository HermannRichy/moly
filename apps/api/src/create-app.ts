import { and, asc, eq, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';

import { CONTENT_VERSION, type Db, ensureSchema } from './db/migrate.js';
import { expressions, lessonResults, lessons, savedExpressions, users } from './db/schema.js';
import { badgesOf, isPlausibleDay, nextStreak, XP_PER_ANSWER } from './logic.js';

export type Deps = {
  db: Db;
  /** Vérifie le jeton de session et renvoie l'identifiant de l'utilisateur, ou null. */
  authenticate: (token: string) => Promise<string | null>;
  now?: () => Date;
};

type Env = { Variables: { userId: string } };

const profilePatch = z
  .object({
    name: z.string().trim().max(80),
    onboarded: z.boolean(),
    reminderMinutes: z.number().int().min(0).max(1439),
    pace: z.enum(['express', 'complet']),
  })
  .partial();

const completion = z.object({
  correct: z.number().int().min(0).max(20),
  total: z.number().int().min(1).max(20),
  day: z.string(),
});

export function createApp({ db, authenticate, now = () => new Date() }: Deps) {
  const app = new Hono<Env>();
  let ready: Promise<void> | null = null;

  app.use('*', cors());
  app.use('*', async (_c, next) => {
    ready ??= ensureSchema(db).catch((error) => {
      ready = null;
      throw error;
    });
    await ready;
    await next();
  });

  app.onError((error, c) => {
    console.error(error);
    return c.json({ error: 'Erreur interne' }, 500);
  });

  app.get('/', (c) => c.json({ name: 'MOLY API', ok: true }));

  app.get('/v1/content', async (c) => {
    const lessonRows = await db.select().from(lessons).where(eq(lessons.published, true)).orderBy(asc(lessons.position));
    const expressionRows = await db.select().from(expressions).orderBy(asc(expressions.position));
    return c.json({
      version: CONTENT_VERSION,
      lessons: lessonRows.map((row) => row.data),
      expressions: expressionRows.map((row) => row.data),
    });
  });

  app.use('/v1/*', async (c, next) => {
    if (c.req.path === '/v1/content') return next();
    const header = c.req.header('authorization') ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    const userId = token ? await authenticate(token) : null;
    if (!userId) return c.json({ error: 'Non authentifié' }, 401);
    c.set('userId', userId);
    await next();
  });

  async function loadState(userId: string) {
    await db.insert(users).values({ id: userId }).onConflictDoNothing();
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    const results = await db.select().from(lessonResults).where(eq(lessonResults.userId, userId));
    const saved = await db.select().from(savedExpressions).where(eq(savedExpressions.userId, userId));
    return {
      name: user.name,
      onboarded: user.onboarded,
      reminderMinutes: user.reminderMinutes,
      pace: user.pace,
      streak: user.streak,
      lastLessonDay: user.lastLessonDay,
      xp: user.xp,
      completed: results.map((row) => row.lessonId),
      perfect: results.filter((row) => row.perfect).map((row) => row.lessonId),
      toReview: results.filter((row) => row.needsReview).map((row) => row.lessonId),
      savedExpressions: saved.map((row) => row.expressionId),
    };
  }

  app.get('/v1/me', async (c) => c.json(await loadState(c.get('userId'))));

  app.patch('/v1/me', async (c) => {
    const parsed = profilePatch.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: 'Données invalides' }, 400);
    const userId = c.get('userId');
    await db.insert(users).values({ id: userId }).onConflictDoNothing();
    if (Object.keys(parsed.data).length > 0) {
      await db.update(users).set(parsed.data).where(eq(users.id, userId));
    }
    return c.json(await loadState(userId));
  });

  app.post('/v1/lessons/:id/complete', async (c) => {
    const parsed = completion.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success || parsed.data.correct > parsed.data.total || !isPlausibleDay(parsed.data.day, now())) {
      return c.json({ error: 'Données invalides' }, 400);
    }
    const userId = c.get('userId');
    const lessonId = c.req.param('id');
    const [lesson] = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.id, lessonId));
    if (!lesson) return c.json({ error: 'Leçon introuvable' }, 404);

    const before = await loadState(userId);
    const { correct, total, day } = parsed.data;
    const isPerfect = correct === total;
    const streak = nextStreak(before.streak, before.lastLessonDay, day);
    const xpGained = correct * XP_PER_ANSWER;

    await db.update(users).set({ streak, lastLessonDay: day, xp: before.xp + xpGained }).where(eq(users.id, userId));
    await db
      .insert(lessonResults)
      .values({ userId, lessonId, perfect: isPerfect, needsReview: !isPerfect })
      .onConflictDoUpdate({
        target: [lessonResults.userId, lessonResults.lessonId],
        set: {
          attempts: sql`${lessonResults.attempts} + 1`,
          perfect: isPerfect || before.perfect.includes(lessonId),
          needsReview: !isPerfect,
          updatedAt: now(),
        },
      });

    const state = await loadState(userId);
    const earnedBefore = badgesOf({ completed: before.completed.length, perfect: before.perfect.length, streak: before.streak });
    const newBadges = badgesOf({ completed: state.completed.length, perfect: state.perfect.length, streak: state.streak }).filter(
      (badge) => !earnedBefore.includes(badge),
    );
    return c.json({ outcome: { correct, total, xpGained, streak, newBadges }, state });
  });

  app.put('/v1/expressions/:id/saved', async (c) => {
    const parsed = z.object({ saved: z.boolean() }).safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: 'Données invalides' }, 400);
    const userId = c.get('userId');
    const expressionId = c.req.param('id');
    if (parsed.data.saved) {
      const [expression] = await db.select({ id: expressions.id }).from(expressions).where(eq(expressions.id, expressionId));
      if (!expression) return c.json({ error: 'Expression introuvable' }, 404);
      await db.insert(savedExpressions).values({ userId, expressionId }).onConflictDoNothing();
    } else {
      await db.delete(savedExpressions).where(and(eq(savedExpressions.userId, userId), eq(savedExpressions.expressionId, expressionId)));
    }
    return c.json(await loadState(userId));
  });

  return app;
}
