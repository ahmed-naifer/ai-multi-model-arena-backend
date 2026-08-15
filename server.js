import express from 'express';
import db from './database.js';
import { requireAuth } from './middleware.js';
import cors from 'cors';

import { registerUser, loginUser } from './auth.js';
import { askAllModels, judgeResponses } from './models.js';
const app = express();
app.use(cors());
const PORT = process.env.PORT || 4000;

app.use(express.json());          // pour lire le JSON envoyé par le frontend
app.use(express.static('public')); // pour servir le fichier index.html

// La route que le frontend va appeler
app.post('/api/compare', requireAuth, async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question manquante' });
    }

    const resultats = await askAllModels(question);
    const verdict = await judgeResponses(question, resultats);

    // Sauvegarde en base, liée à l'utilisateur connecté (req.user.userId vient du token)
    db.prepare(
      'INSERT INTO comparisons (user_id, question, resultats, verdict) VALUES (?, ?, ?, ?)'
    ).run(req.user.userId, question, JSON.stringify(resultats), verdict);

    res.json({ resultats, verdict });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }
    const user = await registerUser(email, password);
    res.json({ message: 'Compte créé avec succès', user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }
    const result = await loginUser(email, password);
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});
app.get('/api/history', requireAuth, (req, res) => {
  try {
    const comparisons = db.prepare(
      'SELECT * FROM comparisons WHERE user_id = ? ORDER BY created_at DESC'
    ).all(req.user.userId);

    // On reconvertit le JSON stocké en texte, en vrai objet JS
    const historique = comparisons.map(c => ({
      id: c.id,
      question: c.question,
      resultats: JSON.parse(c.resultats),
      verdict: c.verdict,
      date: c.created_at,
    }));

    res.json(historique);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
  });
}

export default app;