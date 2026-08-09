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

function fromMins(mins: number): string {
  const v = Math.min(mins, 23 * 60 + 59);
  return `${String(Math.floor(v / 60)).padStart(2, '0')}:${String(v % 60).padStart(2, '0')}`;
}

// Sort three anchor times and enforce a strict 1-minute gap between each pair.
// Equal times produce a zero-length window that makes the earlier slot
// permanently missed; bumping forward prevents that.
export function sortAndEnforceGap(a1: string, a2: string, a3: string): [string, string, string] {
  const m = [a1, a2, a3].sort().map(toMins);
  for (let i = 1; i < 3; i++) {
    if (m[i] <= m[i - 1]) m[i] = m[i - 1] + 1;
  }
  return m.map(fromMins) as [string, string, string];
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
