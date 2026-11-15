import { boolean, integer, jsonb, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';

import type { Expression, Lesson } from '../content/types.js';

export const meta = pgTable('meta', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull().default(''),
  onboarded: boolean('onboarded').notNull().default(false),
  reminderMinutes: integer('reminder_minutes').notNull().default(450),
  pace: text('pace').notNull().default('complet'),
  streak: integer('streak').notNull().default(0),
  lastLessonDay: text('last_lesson_day'),
  xp: integer('xp').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const lessons = pgTable('lessons', {
  id: text('id').primaryKey(),
  position: integer('position').notNull(),
  published: boolean('published').notNull().default(true),
  data: jsonb('data').$type<Lesson>().notNull(),
});

export const expressions = pgTable('expressions', {
  id: text('id').primaryKey(),
  position: integer('position').notNull(),
  data: jsonb('data').$type<Expression>().notNull(),
});

export const lessonResults = pgTable(
  'lesson_results',
  {
    userId: text('user_id').notNull(),
    lessonId: text('lesson_id').notNull(),
    attempts: integer('attempts').notNull().default(1),
    perfect: boolean('perfect').notNull().default(false),
    needsReview: boolean('needs_review').notNull().default(false),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.lessonId] })],
);

export const savedExpressions = pgTable(
  'saved_expressions',
  {
    userId: text('user_id').notNull(),
    expressionId: text('expression_id').notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.expressionId] })],
);

export const schema = { meta, users, lessons, expressions, lessonResults, savedExpressions };
