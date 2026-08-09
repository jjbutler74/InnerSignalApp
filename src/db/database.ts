import * as SQLite from 'expo-sqlite';

let _db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  const db = await SQLite.openDatabaseAsync('innersignal.db');
  await migrate(db);
  _db = db;
  return _db;
}

async function migrate(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`PRAGMA journal_mode = WAL;`);

  // v0: baseline schema (idempotent — safe to re-run every launch)
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

  // Versioned migrations (run once, tracked via PRAGMA user_version)
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const version = row?.user_version ?? 0;

  if (version < 1) {
    // Deduplicate any existing (date, slot) pairs, then enforce uniqueness.
    // Keeps the earliest rowid so no completion history is lost.
    await db.execAsync(`
      BEGIN;
      DELETE FROM completions WHERE rowid NOT IN (
        SELECT MIN(rowid) FROM completions GROUP BY date, slot
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_completions_date_slot ON completions(date, slot);
      PRAGMA user_version = 1;
      COMMIT;
    `);
  }

  if (version < 2) {
    // Add content-category column to packs so Iron vs Sage packs can be
    // toggled independently. All existing built-in packs are Iron-style,
    // so DEFAULT 'iron' is the correct backfill.
    await db.execAsync(`
      BEGIN;
      ALTER TABLE packs ADD COLUMN category TEXT NOT NULL DEFAULT 'iron';
      PRAGMA user_version = 2;
      COMMIT;
    `);
  }

  if (version < 3) {
    // Distinguish seeded affirmations from user-written ones so "Start fresh"
    // can delete custom affirmations while keeping built-in content.
    // All rows that exist at migration time are seeded content → DEFAULT 1.
    await db.execAsync(`
      BEGIN;
      ALTER TABLE affirmations ADD COLUMN is_built_in INTEGER NOT NULL DEFAULT 1;
      PRAGMA user_version = 3;
      COMMIT;
    `);
  }
}

export async function resetDatabase(): Promise<void> {
  const db = await getDb();
  await db.execAsync(`
    DELETE FROM journal_entries;
    DELETE FROM completions;
    DELETE FROM settings;
    DELETE FROM affirmations WHERE is_built_in = 0;
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
