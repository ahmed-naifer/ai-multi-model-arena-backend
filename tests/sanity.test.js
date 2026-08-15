import { test } from 'node:test';
import assert from 'node:assert';

test('1 + 1 doit faire 2', () => {
  assert.strictEqual(1 + 1, 2);
});

test('une chaîne doit contenir un mot', () => {
  assert.ok('Bonjour le monde'.includes('monde'));
});