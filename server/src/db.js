import sqlite3 from 'sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const dbFile = process.env.SQLITE_FILE || './data/app.db';
const resolved = path.isAbsolute(dbFile) ? dbFile : path.join(process.cwd(), dbFile);
fs.mkdirSync(path.dirname(resolved), { recursive: true });

sqlite3.verbose();
export const db = new sqlite3.Database(resolved);

export function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

export function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

export function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

export function initDb() {
  db.serialize(() => {
    db.run('PRAGMA foreign_keys = ON');

    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('income','expense')),
      name TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    db.run('CREATE INDEX IF NOT EXISTS idx_items_user_type ON items(user_id, type)');
    db.run('CREATE INDEX IF NOT EXISTS idx_items_user_type_category ON items(user_id, type, category)');
  });
}

