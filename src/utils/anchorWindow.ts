export type AnchorSlot = 'anchor1' | 'anchor2' | 'anchor3';

export interface AnchorSchedule {
  scheduleAnchor1: string;
  scheduleAnchor2: string;
  scheduleAnchor3: string;
}

function toMins(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

// Each anchor's active window runs from its own time up to the next
// anchor's time (anchor3 has no upper bound until midnight reset).
export function anchorWindow(slot: AnchorSlot, s: AnchorSchedule): { start: number; end: number } {
  const start = toMins(slot === 'anchor1' ? s.scheduleAnchor1 : slot === 'anchor2' ? s.scheduleAnchor2 : s.scheduleAnchor3);
  const end   = slot === 'anchor1' ? toMins(s.scheduleAnchor2)
              : slot === 'anchor2' ? toMins(s.scheduleAnchor3)
              : Infinity;
  return { start, end };
}

// True once the next anchor's window has opened and this one was never read.
export function isAnchorMissed(slot: AnchorSlot, s: AnchorSchedule, nowMins: number): boolean {
  return nowMins >= anchorWindow(slot, s).end;
}
