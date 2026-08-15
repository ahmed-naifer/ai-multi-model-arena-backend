import db from './database.js';

console.log('✅ Base de données initialisée avec succès');
console.log(db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all());