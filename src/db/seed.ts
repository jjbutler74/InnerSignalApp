import { getDb } from './database';
import { insertPackWithAffirmations } from './queries';

export async function seedIfEmpty(): Promise<void> {
  const db = await getDb();
  const existing = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) as n FROM packs');
  if ((existing?.n ?? 0) > 0) return;

  await insertPackWithAffirmations(
    { name: 'Code', tone: 'sage', isBuiltIn: true, isActive: true },
    [
      'I stand by my word, especially when it costs me.',
      'I do the next right thing; quietly, steadily, without excuse.',
      'I am not here to be comfortable. I am here to be worthy of trust.',
      'My character is built in the small choices no one sees.',
      'I meet the day with discipline, courage, and restraint.',
    ],
  );

  await insertPackWithAffirmations(
    { name: 'Discipline', tone: 'terra', isBuiltIn: true, isActive: true },
    [
      'I do what needs doing before I do what is easy.',
      'My standards do not depend on my mood.',
      'I keep promises to myself because my word matters.',
      'I train my mind the same way I train my body; with repetition and patience.',
      'Small acts of discipline become a life of strength.',
    ],
  );

  await insertPackWithAffirmations(
    { name: 'Composure', tone: 'amber', isBuiltIn: true, isActive: true },
    [
      'I stay calm because panic serves nothing.',
      'I breathe, assess, and act.',
      'Pressure reveals my training; it does not own me.',
      'I do not need to react to every provocation.',
      'A steady mind is a form of strength.',
    ],
  );

  await insertPackWithAffirmations(
    { name: 'Focus', tone: 'night', isBuiltIn: true, isActive: true },
    [
      'I give my attention to what matters and withdraw it from what weakens me.',
      'One task. Full effort. No drama.',
      'I do not confuse motion with progress.',
      'I finish the work in front of me.',
      'My focus is a blade; I keep it sharp.',
    ],
  );

  await insertPackWithAffirmations(
    { name: 'Honour', tone: 'soft', isBuiltIn: true, isActive: true },
    [
      'I protect those who depend on me.',
      'I choose truth over approval.',
      'I carry responsibility without resentment.',
      'I am measured by my actions, not my intentions.',
      'I leave people, places, and work better than I found them.',
    ],
  );
}