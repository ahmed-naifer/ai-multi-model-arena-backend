import { DatabaseSync } from 'node:sqlite';

// Crée (ou ouvre si elle existe déjà) un fichier database.db
const db = new DatabaseSync('database.db');

// Table des utilisateurs
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Table des comparaisons (liée à un utilisateur)
db.exec(`
  CREATE TABLE IF NOT EXISTS comparisons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    question TEXT NOT NULL,
    resultats TEXT NOT NULL,
    verdict TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

export default db;