import type { StoreShape } from "./types";
import { score } from "./score";
import { addDays, todayKey } from "./date";

export type StreakState = {
  current: number;
  best: number;
  inWeekTwoWindow: boolean; // days 12..16 of an active streak
};

export function computeStreak(
  store: StoreShape,
  asOf: string = todayKey()
): StreakState {
  // Current streak: count back from `asOf` while each day exists and floorHeld
  let current = 0;
  let cursor = asOf;
  while (true) {
    const d = store.days[cursor];
    if (!d) break;
    const r = score(d);
    if (!r.floorHeld) break;
    current += 1;
    cursor = addDays(cursor, -1);
  }

  // Best streak: scan all logged days chronologically
  const keys = Object.keys(store.days).sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const k of keys) {
    const r = score(store.days[k]);
    if (r.floorHeld) {
      if (prev !== null && addDays(prev, 1) === k) run += 1;
      else run = 1;
      if (run > best) best = run;
      prev = k;
    } else {
      run = 0;
      prev = k;
    }
  }
  if (current > best) best = current;

  const inWeekTwoWindow = current >= 12 && current <= 16;
  return { current, best, inWeekTwoWindow };
}
