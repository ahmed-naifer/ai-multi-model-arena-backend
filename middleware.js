import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  // Le token doit arriver dans le header "Authorization: Bearer xxxxx"
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant, connecte-toi d\'abord' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // On attache les infos de l'utilisateur à la requête
    next(); // On laisse passer vers la vraie route
  } catch (err) {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}