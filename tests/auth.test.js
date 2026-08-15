import { test, before, beforeEach } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

// On force une base de données dédiée aux tests, AVANT d'importer le reste
process.env.DB_FILE = 'test-database.db';
process.env.JWT_SECRET = 'secret_de_test';

// Supprime l'ancienne base de test si elle existe, pour repartir propre
if (fs.existsSync('test-database.db')) {
  fs.unlinkSync('test-database.db');
}

const { registerUser, loginUser } = await import('../auth.js');

test('registerUser crée un nouvel utilisateur', async () => {
  const user = await registerUser('alice@test.com', 'motdepasse123');
  assert.strictEqual(user.email, 'alice@test.com');
  assert.ok(user.id); // un id a bien été généré
});

test('registerUser refuse un email déjà utilisé', async () => {
  await registerUser('bob@test.com', 'motdepasse123');

  await assert.rejects(
    async () => await registerUser('bob@test.com', 'autremotdepasse'),
    { message: 'Cet email est déjà utilisé' }
  );
});

test('loginUser réussit avec les bons identifiants', async () => {
  await registerUser('charlie@test.com', 'motdepasse123');

  const result = await loginUser('charlie@test.com', 'motdepasse123');
  assert.ok(result.token); // un token a bien été généré
  assert.strictEqual(result.user.email, 'charlie@test.com');
});

test('loginUser échoue avec un mauvais mot de passe', async () => {
  await registerUser('dave@test.com', 'motdepasse123');

  await assert.rejects(
    async () => await loginUser('dave@test.com', 'mauvaispass'),
    { message: 'Email ou mot de passe incorrect' }
  );
});

test('loginUser échoue avec un email inexistant', async () => {
  await assert.rejects(
    async () => await loginUser('inconnu@test.com', 'peuimporte'),
    { message: 'Email ou mot de passe incorrect' }
  );
});