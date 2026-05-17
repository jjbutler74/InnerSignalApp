import { getDb } from './database';
import { insertPackWithAffirmations } from './queries';

export async function seedIfEmpty(): Promise<void> {
  const db = await getDb();
  const existing = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) as n FROM packs');
  if ((existing?.n ?? 0) > 0) return;

  await insertPackWithAffirmations(
    { name: 'Yours', tone: 'sage', isBuiltIn: true, isActive: true },
    [
      'I am allowed to take up space — and to move slowly when I need to.',
      'I trust the version of me that keeps showing up.',
      'My feelings are information, not verdicts.',
      'I do not have to earn rest.',
      'I am doing better than I think I am.',
    ],
  );

  await insertPackWithAffirmations(
    { name: 'Confidence', tone: 'terra', isBuiltIn: true, isActive: true },
    [
      'My pace is mine. I do not need to apologize for it.',
      'I have handled hard things before. I will handle this one too.',
      'I am allowed to change my mind without explanation.',
      'What I bring to the room is enough.',
      'I do not need certainty to take the next step.',
    ],
  );

  await insertPackWithAffirmations(
    { name: 'Calm', tone: 'amber', isBuiltIn: true, isActive: true },
    [
      'I can return to my breath. I can return to now.',
      'This moment does not require me to solve everything.',
      'Slow is not behind. Slow is present.',
      'The ground is still here. I am still here.',
      'I let the urgency pass. It always does.',
    ],
  );

  await insertPackWithAffirmations(
    { name: 'Focus', tone: 'night', isBuiltIn: true, isActive: true },
    [
      'One thing at a time is still progress.',
      'I do not have to be perfect to be useful.',
      'Distraction is not failure — returning is the practice.',
      'I know what matters. I will come back to it.',
      'Clarity comes when I stop fighting the noise.',
    ],
  );

  await insertPackWithAffirmations(
    { name: 'Worth', tone: 'soft', isBuiltIn: true, isActive: true },
    [
      'I deserve what I am willing to give to others.',
      'Being kind to myself is not indulgence — it is foundation.',
      'My worth is not a performance review.',
      'I am allowed to be a work in progress and still be enough.',
      'The care I extend outward belongs inward too.',
    ],
  );
}
