const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'gym_tracker.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS sets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exercise TEXT NOT NULL,
    weight REAL NOT NULL,
    reps INTEGER NOT NULL,
    date TEXT NOT NULL
  )
`);

module.exports = db;
