import { test, before } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import request from 'supertest';

process.env.DB_FILE = 'test-database-server.db';
process.env.JWT_SECRET = 'secret_de_test';
process.env.NODE_ENV = 'test';

if (fs.existsSync('test-database-server.db')) {
  fs.unlinkSync('test-database-server.db');
}

const { default: app } = await import('../server.js');

test('POST /api/register crée un compte', async () => {
  const response = await request(app)
    .post('/api/register')
    .send({ email: 'test-integration@test.com', password: 'motdepasse123' });

  assert.strictEqual(response.status, 200);
  assert.strictEqual(response.body.user.email, 'test-integration@test.com');
});

test('POST /api/login retourne un token', async () => {
  const response = await request(app)
    .post('/api/login')
    .send({ email: 'test-integration@test.com', password: 'motdepasse123' });

  assert.strictEqual(response.status, 200);
  assert.ok(response.body.token);
});

test('POST /api/compare sans token est refusé', async () => {
  const response = await request(app)
    .post('/api/compare')
    .send({ question: 'test' });

  assert.strictEqual(response.status, 401);
});

test('GET /api/history sans token est refusé', async () => {
  const response = await request(app).get('/api/history');

  assert.strictEqual(response.status, 401);
});