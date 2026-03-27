const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/club_match.db');

// sql.js is a pure JavaScript SQLite implementation — no native compilation needed.
// It loads the database into memory. We read from disk on startup and write back on changes.
// For tests, NODE_ENV=test skips disk persistence entirely (fresh in-memory DB every run).

let db;

async function initDb() {
  const SQL = await initSqlJs();

  if (process.env.NODE_ENV === 'test') {
    // In-memory only for tests — isolated, no leftover data between runs
    db = new SQL.Database();
  } else {
    // Load existing DB file if it exists, otherwise start fresh
    const fileBuffer = fs.existsSync(DB_PATH)
      ? fs.readFileSync(DB_PATH)
      : null;
    db = fileBuffer ? new SQL.Database(fileBuffer) : new SQL.Database();
  }

  // Create tables if they don't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      favoriteClub TEXT NOT NULL,
      createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS match_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      club TEXT NOT NULL,
      opponent TEXT NOT NULL,
      matchDate TEXT NOT NULL,
      competition TEXT,
      noteTitle TEXT NOT NULL,
      noteBody TEXT,
      watched INTEGER DEFAULT 1,
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES users(id)
    );
  `);

  return db;
}

// Persist the in-memory database back to disk after writes
function saveDb() {
  if (process.env.NODE_ENV === 'test') return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, buffer);
}

// Helper: run a query that modifies data (INSERT, UPDATE, DELETE)
function run(sql, params = []) {
  db.run(sql, params);
  const lastId = db.exec('SELECT last_insert_rowid()')[0]?.values[0][0] ?? null;
  saveDb();
  return { lastInsertRowid: lastId };
}

// Helper: get a single row
function get(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return undefined;
}

// Helper: get all matching rows
function all(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

module.exports = { initDb, run, get, all };
