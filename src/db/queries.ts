import { getDb, uid, today, localDateString, parseLocalDate } from './database';
import type { Pack, Affirmation, JournalEntry, UserSettings, Completion, Slot } from '../types';

// ─── Settings ────────────────────────────────────────────────────────────────

export async function loadSettings(): Promise<Partial<UserSettings>> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ key: string; value: string }>('SELECT key, value FROM settings');
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;

  const out: Partial<UserSettings> = {};
  if (map.name             !== undefined) out.name              = map.name;
  if (map.scheduleAnchor1  !== undefined) out.scheduleAnchor1   = map.scheduleAnchor1;
  if (map.scheduleAnchor2  !== undefined) out.scheduleAnchor2   = map.scheduleAnchor2;
  if (map.scheduleAnchor3  !== undefined) out.scheduleAnchor3   = map.scheduleAnchor3;
  if (map.scheduleGratitude !== undefined) out.scheduleGratitude = map.scheduleGratitude;
  if (map.gratitudeCount   !== undefined) out.gratitudeCount    = (Number(map.gratitudeCount) || 3) as 1 | 2 | 3;
  if (map.quietHoursStart  !== undefined) out.quietHoursStart   = map.quietHoursStart || null;
  if (map.quietHoursEnd    !== undefined) out.quietHoursEnd     = map.quietHoursEnd   || null;
  if (map.weekendMode      !== undefined) out.weekendMode       = map.weekendMode === '1';
  if (map.sound            !== undefined) out.sound             = map.sound as UserSettings['sound'];
  if (map.theme            !== undefined) out.theme             = map.theme as UserSettings['theme'];
  if (map.favoritesOnly      !== undefined) out.favoritesOnly      = map.favoritesOnly === '1';
  if (map.onboardingComplete !== undefined) out.onboardingComplete = map.onboardingComplete === '1';
  return out;
}

export async function saveSettings(settings: Partial<UserSettings>): Promise<void> {
  const db = await getDb();
  const entries: [string, string][] = [];

  if (settings.name             !== undefined) entries.push(['name',              settings.name]);
  if (settings.scheduleAnchor1  !== undefined) entries.push(['scheduleAnchor1',   settings.scheduleAnchor1]);
  if (settings.scheduleAnchor2  !== undefined) entries.push(['scheduleAnchor2',   settings.scheduleAnchor2]);
  if (settings.scheduleAnchor3  !== undefined) entries.push(['scheduleAnchor3',   settings.scheduleAnchor3]);
  if (settings.scheduleGratitude !== undefined) entries.push(['scheduleGratitude', settings.scheduleGratitude]);
  if (settings.gratitudeCount   !== undefined) entries.push(['gratitudeCount',    String(settings.gratitudeCount)]);
  if (settings.quietHoursStart  !== undefined) entries.push(['quietHoursStart',   settings.quietHoursStart ?? '']);
  if (settings.quietHoursEnd    !== undefined) entries.push(['quietHoursEnd',     settings.quietHoursEnd   ?? '']);
  if (settings.weekendMode      !== undefined) entries.push(['weekendMode',        settings.weekendMode ? '1' : '0']);
  if (settings.sound            !== undefined) entries.push(['sound',             settings.sound]);
  if (settings.theme            !== undefined) entries.push(['theme',             settings.theme]);
  if (settings.favoritesOnly      !== undefined) entries.push(['favoritesOnly',      settings.favoritesOnly ? '1' : '0']);
  if (settings.onboardingComplete !== undefined) entries.push(['onboardingComplete', settings.onboardingComplete ? '1' : '0']);

  await db.withTransactionAsync(async () => {
    for (const [key, value] of entries) {
      await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]);
    }
  });
}

// ─── Packs ───────────────────────────────────────────────────────────────────

type PackRow = { id: string; name: string; tone: string; is_built_in: number; is_active: number };

function rowToPack(r: PackRow): Pack {
  return {
    id: r.id,
    name: r.name,
    tone: r.tone as Pack['tone'],
    isBuiltIn: r.is_built_in === 1,
    isActive:  r.is_active  === 1,
  };
}

export async function getPacks(): Promise<Pack[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<PackRow>('SELECT * FROM packs ORDER BY name');
  return rows.map(rowToPack);
}

export async function insertPack(pack: Omit<Pack, 'id'>): Promise<Pack> {
  const db = await getDb();
  const id = uid();
  await db.runAsync(
    'INSERT INTO packs (id, name, tone, is_built_in, is_active) VALUES (?, ?, ?, ?, ?)',
    [id, pack.name, pack.tone, pack.isBuiltIn ? 1 : 0, pack.isActive ? 1 : 0],
  );
  return { id, ...pack };
}

export async function setPackActive(id: string, active: boolean): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE packs SET is_active = ? WHERE id = ?', [active ? 1 : 0, id]);
}

// ─── Affirmations ─────────────────────────────────────────────────────────────

type AffirmationRow = {
  id: string; text: string; pack_id: string;
  is_favorite: number; seen_count: number; created_at: string;
};

function rowToAffirmation(r: AffirmationRow): Affirmation {
  return {
    id: r.id,
    text: r.text,
    packId: r.pack_id,
    isFavorite: r.is_favorite === 1,
    seenCount: r.seen_count,
    createdAt: r.created_at,
  };
}

export async function getAffirmations(): Promise<Affirmation[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<AffirmationRow>(
    'SELECT * FROM affirmations ORDER BY created_at DESC',
  );
  return rows.map(rowToAffirmation);
}

export async function insertAffirmation(text: string, packId: string): Promise<Affirmation> {
  const db = await getDb();
  const id = uid();
  const createdAt = new Date().toISOString();
  await db.runAsync(
    'INSERT INTO affirmations (id, text, pack_id, is_favorite, seen_count, created_at) VALUES (?, ?, ?, 0, 0, ?)',
    [id, text, packId, createdAt],
  );
  return { id, text, packId, isFavorite: false, seenCount: 0, createdAt };
}

export async function toggleFavorite(id: string, current: boolean): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE affirmations SET is_favorite = ? WHERE id = ?', [current ? 0 : 1, id]);
}

export async function incrementSeenCount(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE affirmations SET seen_count = seen_count + 1 WHERE id = ?', [id]);
}

export async function deleteAffirmation(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM affirmations WHERE id = ?', [id]);
}

export async function insertPackWithAffirmations(
  pack: Omit<Pack, 'id'>,
  texts: string[],
): Promise<void> {
  const db = await getDb();
  const packId = uid();
  const now = new Date().toISOString();
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'INSERT OR IGNORE INTO packs (id, name, tone, is_built_in, is_active) VALUES (?, ?, ?, ?, ?)',
      [packId, pack.name, pack.tone, 1, 1],
    );
    for (const text of texts) {
      await db.runAsync(
        'INSERT OR IGNORE INTO affirmations (id, text, pack_id, is_favorite, seen_count, created_at) VALUES (?, ?, ?, 0, 0, ?)',
        [uid(), text, packId, now],
      );
    }
  });
}

// ─── Journal ─────────────────────────────────────────────────────────────────

type JournalRow = {
  id: string; date: string; items: string;
  mood: string; mood_color: string; created_at: string;
};

function rowToEntry(r: JournalRow): JournalEntry {
  return {
    id: r.id,
    date: r.date,
    items: JSON.parse(r.items) as string[],
    mood: r.mood as JournalEntry['mood'],
    moodColor: r.mood_color,
    createdAt: r.created_at,
  };
}

export async function isTodayGratitudeDone(): Promise<boolean> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ n: number }>(
    'SELECT COUNT(*) as n FROM journal_entries WHERE date = ?', [today()],
  );
  return (row?.n ?? 0) > 0;
}

export async function getJournalEntries(): Promise<JournalEntry[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<JournalRow>(
    'SELECT * FROM journal_entries ORDER BY date DESC',
  );
  return rows.map(rowToEntry);
}

export async function upsertJournalEntry(
  date: string,
  items: string[],
  mood: JournalEntry['mood'],
  moodColor: string,
): Promise<JournalEntry> {
  const db = await getDb();
  const existing = await db.getFirstAsync<JournalRow>(
    'SELECT * FROM journal_entries WHERE date = ?', [date],
  );
  if (existing) {
    await db.runAsync(
      'UPDATE journal_entries SET items = ?, mood = ?, mood_color = ? WHERE id = ?',
      [JSON.stringify(items), mood, moodColor, existing.id],
    );
    return rowToEntry({ ...existing, items: JSON.stringify(items), mood, mood_color: moodColor });
  }
  const id = uid();
  const createdAt = new Date().toISOString();
  await db.runAsync(
    'INSERT INTO journal_entries (id, date, items, mood, mood_color, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [id, date, JSON.stringify(items), mood, moodColor, createdAt],
  );
  return { id, date, items, mood, moodColor, createdAt };
}

// ─── Completions (streak) ─────────────────────────────────────────────────────

export async function recordCompletion(affirmationId: string, slot: Slot): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT OR IGNORE INTO completions (id, date, affirmation_id, slot) VALUES (?, ?, ?, ?)',
    [uid(), today(), affirmationId, slot],
  );
}

export async function getTodayCompletedSlots(): Promise<string[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ slot: string }>(
    'SELECT DISTINCT slot FROM completions WHERE date = ?',
    [today()],
  );
  return rows.map(r => r.slot);
}

export async function getCompletionDates(limitDays = 30): Promise<string[]> {
  const db = await getDb();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - limitDays);
  const rows = await db.getAllAsync<{ date: string }>(
    'SELECT DISTINCT date FROM completions WHERE date >= ? ORDER BY date DESC',
    [localDateString(cutoff)],
  );
  return rows.map(r => r.date);
}

export async function getJournalDates(limitDays = 30): Promise<string[]> {
  const db = await getDb();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - limitDays);
  const rows = await db.getAllAsync<{ date: string }>(
    'SELECT date FROM journal_entries WHERE date >= ? ORDER BY date DESC',
    [localDateString(cutoff)],
  );
  return rows.map(r => r.date);
}

export async function getTotalCounts(): Promise<{ totalSeen: number; totalEvenings: number }> {
  const db = await getDb();
  const seen = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) as n FROM completions');
  const evenings = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) as n FROM journal_entries');
  return { totalSeen: seen?.n ?? 0, totalEvenings: evenings?.n ?? 0 };
}

export async function getWeeklyMoodValues(): Promise<(number | null)[]> {
  const db = await getDb();
  const moodScale: Record<string, number> = {
    Heavy: 0, Mixed: 0.25, Steady: 0.5, Clear: 0.75, Resolved: 1,
  };

  const monday = getMondayOfCurrentWeek();
  const rows = await db.getAllAsync<{ date: string; mood: string }>(
    'SELECT date, mood FROM journal_entries WHERE date >= ? ORDER BY date ASC',
    [monday],
  );
  const byDate: Record<string, number> = {};
  for (const r of rows) byDate[r.date] = moodScale[r.mood] ?? 0.5;

  return Array.from({ length: 7 }, (_, i) => {
    const d = parseLocalDate(monday);
    d.setDate(d.getDate() + i);
    const key = localDateString(d);
    return byDate[key] ?? null;
  });
}

function getMondayOfCurrentWeek(): string {
  const d = new Date();
  const day = d.getDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return localDateString(d);
}
