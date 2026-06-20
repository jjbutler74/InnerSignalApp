import * as SQLite from 'expo-sqlite';

let _db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync('innersignal.db');
  await migrate(_db);
  return _db;
}

async function migrate(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`PRAGMA journal_mode = WAL;`);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS packs (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      tone       TEXT NOT NULL,
      is_built_in INTEGER NOT NULL DEFAULT 1,
      is_active   INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS affirmations (
      id          TEXT PRIMARY KEY,
      text        TEXT NOT NULL,
      pack_id     TEXT NOT NULL REFERENCES packs(id),
      is_favorite INTEGER NOT NULL DEFAULT 0,
      seen_count  INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS journal_entries (
      id         TEXT PRIMARY KEY,
      date       TEXT NOT NULL UNIQUE,
      items      TEXT NOT NULL,
      mood       TEXT NOT NULL,
      mood_color TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS completions (
      id              TEXT PRIMARY KEY,
      date            TEXT NOT NULL,
      affirmation_id  TEXT NOT NULL,
      slot            TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_completions_date ON completions(date);
    CREATE INDEX IF NOT EXISTS idx_affirmations_pack ON affirmations(pack_id);
  `);
}

export async function resetDatabase(): Promise<void> {
  const db = await getDb();
  await db.execAsync(`
    DELETE FROM journal_entries;
    DELETE FROM completions;
    DELETE FROM settings;
    UPDATE affirmations SET seen_count = 0, is_favorite = 0;
  `);
}

export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// Local calendar date as YYYY-MM-DD. toISOString() is UTC-based, which rolls
// over to the next day many hours after local midnight in timezones ahead of
// UTC (e.g. NZT) — using it here made "new day" resets fire near local noon
// instead of midnight.
export function localDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function today(): string {
  return localDateString(new Date());
}

// new Date("YYYY-MM-DD") parses as UTC midnight, which lands on the previous
// local calendar day in negative-UTC-offset timezones. Parse the components
// directly so the result is local midnight on the intended date instead.
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}
