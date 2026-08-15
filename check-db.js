import db from './database.js';

const rows = db.prepare('SELECT * FROM comparisons').all();
console.log(rows);