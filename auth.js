import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from './database.js';

export async function registerUser(email, password) {
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existingUser) {
    throw new Error('Cet email est déjà utilisé');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const result = db.prepare(
    'INSERT INTO users (email, password_hash) VALUES (?, ?)'
  ).run(email, passwordHash);

  return { id: result.lastInsertRowid, email };
}

export async function loginUser(email, password) {
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  if (!user) {
    throw new Error('Email ou mot de passe incorrect');
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) {
    throw new Error('Email ou mot de passe incorrect');
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { token, user: { id: user.id, email: user.email } };
}