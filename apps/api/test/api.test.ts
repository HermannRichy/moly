import assert from 'node:assert/strict';
import { test } from 'node:test';

import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';

import { createApp } from '../src/create-app.js';
import { schema } from '../src/db/schema.js';

const NOW = new Date('2026-11-15T12:00:00Z');

function setup() {
  const db = drizzle(new PGlite(), { schema });
  let now = NOW;
  const deleted: string[] = [];
  const app = createApp({ db, authenticate: async (token) => (token.startsWith('user-') ? token : null),
    deleteIdentity: async (userId) => {
      deleted.push(userId);
    },
    now: () => now,
  });
  const call = (path: string, init: { method?: string; token?: string; body?: unknown } = {}) =>
    app.request(path, {
      method: init.method ?? 'GET',
      headers: { 'content-type': 'application/json', ...(init.token ? { authorization: `Bearer ${init.token}` } : {}) },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
  return { call, deleted, setNow: (value: Date) => (now = value) };
}

test('le contenu est complet et réservé aux comptes connectés', async () => {
  const { call } = setup();
  assert.equal((await call('/v1/content')).status, 401);
  const res = await call('/v1/content', { token: 'user-a' });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.lessons.length, 30);
  assert.equal(body.expressions.length, 30);
  assert.equal(body.lessons[0].id, 'participe-passe-avoir');
});

test('le profil exige une session', async () => {
  const { call } = setup();
  assert.equal((await call('/v1/me')).status, 401);
  assert.equal((await call('/v1/me', { token: 'intrus' })).status, 401);
});

test('le profil est créé puis modifiable', async () => {
  const { call } = setup();
  const fresh = await (await call('/v1/me', { token: 'user-a' })).json();
  assert.deepEqual({ streak: fresh.streak, xp: fresh.xp, onboarded: fresh.onboarded, completed: fresh.completed }, { streak: 0, xp: 0, onboarded: false, completed: [] });
  const patched = await (await call('/v1/me', { method: 'PATCH', token: 'user-a', body: { name: 'Hermann', onboarded: true, pace: 'express', reminderMinutes: 1200 } })).json();
  assert.deepEqual({ name: patched.name, onboarded: patched.onboarded, pace: patched.pace, reminderMinutes: patched.reminderMinutes }, { name: 'Hermann', onboarded: true, pace: 'express', reminderMinutes: 1200 });
  assert.equal((await call('/v1/me', { method: 'PATCH', token: 'user-a', body: { pace: 'lent' } })).status, 400);
});

test('terminer des leçons fait évoluer la série, les XP, les badges et les révisions', async () => {
  const { call, setNow } = setup();
  const complete = (id: string, correct: number, day: string) =>
    call(`/v1/lessons/${id}/complete`, { method: 'POST', token: 'user-a', body: { correct, total: 4, day } });

  const first = await (await complete('participe-passe-avoir', 3, '2026-11-15')).json();
  assert.deepEqual(first.outcome, { correct: 3, total: 4, xpGained: 30, streak: 1, newBadges: ['premiere-lecon'] });
  assert.deepEqual(first.state.toReview, ['participe-passe-avoir']);

  const sameDay = await (await complete('bien-que-apres-que', 4, '2026-11-15')).json();
  assert.equal(sameDay.outcome.streak, 1);
  assert.deepEqual(sameDay.outcome.newBadges, ['sans-faute']);
  assert.equal(sameDay.state.xp, 70);

  setNow(new Date('2026-11-16T09:00:00Z'));
  const nextDay = await (await complete('participe-passe-avoir', 4, '2026-11-16')).json();
  assert.equal(nextDay.outcome.streak, 2);
  assert.deepEqual(nextDay.state.toReview, []);
  assert.deepEqual(nextDay.state.completed.sort(), ['bien-que-apres-que', 'participe-passe-avoir']);

  setNow(new Date('2026-11-19T09:00:00Z'));
  const afterGap = await (await complete('leur-leurs', 4, '2026-11-19')).json();
  assert.equal(afterGap.outcome.streak, 1);

  const other = await (await call('/v1/me', { token: 'user-b' })).json();
  assert.equal(other.xp, 0);
});

test('les envois invalides sont refusés', async () => {
  const { call } = setup();
  const post = (id: string, body: unknown) => call(`/v1/lessons/${id}/complete`, { method: 'POST', token: 'user-a', body });
  assert.equal((await post('participe-passe-avoir', { correct: 5, total: 4, day: '2026-11-15' })).status, 400);
  assert.equal((await post('participe-passe-avoir', { correct: 4, total: 4, day: '2026-12-25' })).status, 400);
  assert.equal((await post('inconnue', { correct: 4, total: 4, day: '2026-11-15' })).status, 404);
});

test('une expression peut être enregistrée puis retirée', async () => {
  const { call } = setup();
  const put = (id: string, saved: boolean) => call(`/v1/expressions/${id}/saved`, { method: 'PUT', token: 'user-a', body: { saved } });
  assert.deepEqual((await (await put('nonobstant', true)).json()).savedExpressions, ['nonobstant']);
  assert.deepEqual((await (await put('nonobstant', true)).json()).savedExpressions, ['nonobstant']);
  assert.deepEqual((await (await put('nonobstant', false)).json()).savedExpressions, []);
  assert.equal((await put('inconnue', true)).status, 404);
});

test('supprimer le compte efface ses données et son identité', async () => {
  const { call, deleted } = setup();
  await call('/v1/lessons/participe-passe-avoir/complete', { method: 'POST', token: 'user-a', body: { correct: 4, total: 4, day: '2026-11-15' } });
  await call('/v1/expressions/nonobstant/saved', { method: 'PUT', token: 'user-a', body: { saved: true } });
  await call('/v1/lessons/leur-leurs/complete', { method: 'POST', token: 'user-b', body: { correct: 4, total: 4, day: '2026-11-15' } });

  const res = await call('/v1/me', { method: 'DELETE', token: 'user-a' });
  assert.equal(res.status, 200);
  assert.deepEqual(deleted, ['user-a']);

  const again = await (await call('/v1/me', { token: 'user-a' })).json();
  assert.deepEqual({ xp: again.xp, completed: again.completed, saved: again.savedExpressions }, { xp: 0, completed: [], saved: [] });
  const other = await (await call('/v1/me', { token: 'user-b' })).json();
  assert.equal(other.xp, 40);
});
