import { eq, sql } from 'drizzle-orm';
import type { PgDatabase } from 'drizzle-orm/pg-core';

import { expressions as expressionContent } from '../content/expressions.js';
import { lessons as lessonContent } from '../content/lessons.js';
import { expressions, lessons, meta, type schema } from './schema.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Db = PgDatabase<any, typeof schema>;

/** À incrémenter à chaque modification du contenu pour le réimporter en base. */
export const CONTENT_VERSION = '2';

/** Instructions idempotentes : elles peuvent être rejouées sans risque. */
const STATEMENTS = [
  `create table if not exists meta (key text primary key, value text not null)`,
  `create table if not exists users (
    id text primary key,
    name text not null default '',
    onboarded boolean not null default false,
    reminder_minutes integer not null default 450,
    pace text not null default 'complet',
    streak integer not null default 0,
    last_lesson_day text,
    xp integer not null default 0,
    created_at timestamptz not null default now()
  )`,
  `create table if not exists lessons (
    id text primary key,
    position integer not null,
    published boolean not null default true,
    data jsonb not null
  )`,
  `create table if not exists expressions (
    id text primary key,
    position integer not null,
    data jsonb not null
  )`,
  `create table if not exists lesson_results (
    user_id text not null,
    lesson_id text not null,
    attempts integer not null default 1,
    perfect boolean not null default false,
    needs_review boolean not null default false,
    updated_at timestamptz not null default now(),
    primary key (user_id, lesson_id)
  )`,
  `create table if not exists saved_expressions (
    user_id text not null,
    expression_id text not null,
    primary key (user_id, expression_id)
  )`,
];

/** Crée les tables si besoin, puis importe le contenu quand sa version a changé. */
export async function ensureSchema(db: Db): Promise<void> {
  for (const statement of STATEMENTS) {
    await db.execute(sql.raw(statement));
  }
  const current = await db.select().from(meta).where(eq(meta.key, 'content_version'));
  if (current[0]?.value === CONTENT_VERSION) return;

  for (const [position, lesson] of lessonContent.entries()) {
    await db
      .insert(lessons)
      .values({ id: lesson.id, position, data: lesson })
      .onConflictDoUpdate({ target: lessons.id, set: { position, data: lesson } });
  }
  for (const [position, expression] of expressionContent.entries()) {
    await db
      .insert(expressions)
      .values({ id: expression.id, position, data: expression })
      .onConflictDoUpdate({ target: expressions.id, set: { position, data: expression } });
  }
  await db
    .insert(meta)
    .values({ key: 'content_version', value: CONTENT_VERSION })
    .onConflictDoUpdate({ target: meta.key, set: { value: CONTENT_VERSION } });
}
