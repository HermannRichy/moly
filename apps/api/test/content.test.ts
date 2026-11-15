import assert from 'node:assert/strict';
import { test } from 'node:test';

import { expressions } from '../src/content/expressions.js';
import { lessons } from '../src/content/lessons.js';

function normalize(value: string): string {
  return value.toLowerCase().replace(/[’`´]/g, "'").replace(/[.!?…]+$/g, '').replace(/\s+/g, ' ').trim();
}

test('le contenu compte 30 leçons et 30 expressions, sans doublon', () => {
  assert.equal(lessons.length, 30);
  assert.equal(expressions.length, 30);
  assert.equal(new Set(lessons.map((l) => l.id)).size, 30);
  assert.equal(new Set(expressions.map((e) => e.id)).size, 30);
});

test('chaque leçon est cohérente', () => {
  for (const lesson of lessons) {
    assert.ok(lesson.rule.includes(lesson.highlight), `${lesson.id} : mot surligné absent de la règle`);
    assert.equal(lesson.examples.length, 2, lesson.id);
    const [qcm, gap, fix, rephrase] = lesson.exercises;
    assert.equal(qcm.type, 'qcm');
    assert.equal(gap.type, 'trous');
    assert.equal(fix.type, 'correction');
    assert.equal(rephrase.type, 'reformulation');
    assert.equal(qcm.sentence.split('___').length, 2, `${lesson.id} : QCM sans emplacement unique`);
    assert.ok(qcm.options.includes(qcm.answer), `${lesson.id} : réponse du QCM absente des options`);
    assert.equal(new Set(qcm.options).size, qcm.options.length, `${lesson.id} : options en double`);
    assert.equal(gap.sentence.split('___').length, 2, `${lesson.id} : texte à trous sans emplacement unique`);
    assert.ok(gap.answers.length > 0 && fix.answers.length > 0, lesson.id);
    for (const answer of fix.answers) {
      assert.notEqual(normalize(answer), normalize(fix.sentence), `${lesson.id} : correction identique à la phrase`);
    }
    const model = normalize(rephrase.model);
    const hits = rephrase.keywords.filter((keyword) => model.includes(normalize(keyword)));
    assert.equal(hits.length, rephrase.keywords.length, `${lesson.id} : tournure absente du modèle`);
  }
});
