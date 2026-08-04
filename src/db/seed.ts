import { getDb } from './database';
import { insertPackWithAffirmations } from './queries';

export async function seedIfEmpty(): Promise<void> {
  const db = await getDb();
  const existing = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) as n FROM packs');
  if ((existing?.n ?? 0) > 0) return;

  await insertPackWithAffirmations(
    { name: 'Code', tone: 'sage', isBuiltIn: true, isActive: true, category: 'iron' },
    [
      'I stand by my word, especially when it costs me.',
      'I do the next right thing; quietly, steadily, without excuse.',
      'I am not here to be comfortable. I am here to be worthy of trust.',
      'My character is built in the small choices no one sees.',
      'I meet the day with discipline, courage, and restraint.',
    ],
  );

  await insertPackWithAffirmations(
    { name: 'Discipline', tone: 'terra', isBuiltIn: true, isActive: true, category: 'iron' },
    [
      'I do what needs doing before I do what is easy.',
      'My standards do not depend on my mood.',
      'I keep promises to myself because my word matters.',
      'I train my mind the same way I train my body; with repetition and patience.',
      'Small acts of discipline become a life of strength.',
    ],
  );

  await insertPackWithAffirmations(
    { name: 'Composure', tone: 'amber', isBuiltIn: true, isActive: true, category: 'iron' },
    [
      'I stay calm because panic serves nothing.',
      'I breathe, assess, and act.',
      'Pressure reveals my training; it does not own me.',
      'I do not need to react to every provocation.',
      'A steady mind is a form of strength.',
    ],
  );

  await insertPackWithAffirmations(
    { name: 'Focus', tone: 'night', isBuiltIn: true, isActive: true, category: 'iron' },
    [
      'I give my attention to what matters and withdraw it from what weakens me.',
      'One task. Full effort. No drama.',
      'I do not confuse motion with progress.',
      'I finish the work in front of me.',
      'My focus is a blade; I keep it sharp.',
    ],
  );

  await insertPackWithAffirmations(
    { name: 'Honour', tone: 'soft', isBuiltIn: true, isActive: true, category: 'iron' },
    [
      'I protect those who depend on me.',
      'I choose truth over approval.',
      'I carry responsibility without resentment.',
      'I am measured by my actions, not my intentions.',
      'I leave people, places, and work better than I found them.',
    ],
  );

  await seedSagePacks();
}

// Idempotent — safe to call on every launch.
// Inserts Sage packs for users who onboarded before this feature shipped.
// Skipped if the user explicitly chose Iron at onboarding (tonePreference = 'iron').
export async function seedSagePacks(): Promise<void> {
  const db = await getDb();
  const pref = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM settings WHERE key = 'tonePreference'",
  );
  if (pref?.value === 'iron') return;
  const existing = await db.getFirstAsync<{ n: number }>(
    "SELECT COUNT(*) as n FROM packs WHERE category = 'sage'",
  );
  if ((existing?.n ?? 0) > 0) return;

  await insertPackWithAffirmations(
    { name: 'Warmth', tone: 'terra', isBuiltIn: true, isActive: true, category: 'sage' },
    [
      'I am worthy of love and belonging, exactly as I am.',
      'I extend to myself the same kindness I offer others.',
      'My feelings are valid and deserve to be heard.',
      'I choose connection over perfection.',
      'I open my heart with both courage and care.',
      'Gentleness toward myself makes me more present for others.',
    ],
  );

  await insertPackWithAffirmations(
    { name: 'Stillness', tone: 'sage', isBuiltIn: true, isActive: true, category: 'sage' },
    [
      'I give myself permission to rest without having to earn it first.',
      'This moment is enough. I am enough in it.',
      'I listen to what my body and heart are telling me.',
      'Pausing is not giving up; it is gathering myself.',
      'I do not need to rush what is unfolding.',
      'There is wisdom in being still.',
    ],
  );

  await insertPackWithAffirmations(
    { name: 'Growth', tone: 'amber', isBuiltIn: true, isActive: true, category: 'sage' },
    [
      'I am becoming, and that is always enough.',
      'My setbacks are not proof I am broken; they are part of the path.',
      'I hold my imperfections with curiosity, not judgement.',
      'Progress does not have to look impressive to be real.',
      'I release the version of me I thought I had to be.',
      'Every small step I take still counts.',
    ],
  );

  await insertPackWithAffirmations(
    { name: 'Resilience', tone: 'night', isBuiltIn: true, isActive: true, category: 'sage' },
    [
      'I have moved through hard things before and I will again.',
      'I can carry difficulty without letting it define me.',
      'Asking for help is strength, not weakness.',
      'I am allowed to be both a work in progress and enough right now.',
      'I meet this day with patience and an open hand.',
      'My story is still being written.',
    ],
  );
}