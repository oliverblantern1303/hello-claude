import type { DayLog, ScoreResult } from "./types";

export const BUILD_CAP = 39;

export function score(d: DayLog): ScoreResult {
  // TRACK A — Closing (max 50)
  let A = 0;
  if (d.a1_keystone) A += 20;
  A += Math.min(d.a2_extra_asks, 3) * 5; // cap +15
  if (d.a3_price_hold) A += 10;
  if (d.a3_preempt_discount) A -= 5; // honesty penalty
  if (d.a4_meeting_held) A += 5;
  A = Math.max(A, 0);

  // TRACK B — Pipeline (max 20)
  const B =
    Math.min(d.b1_new_prospects, 3) * 4 + // cap +12
    Math.min(d.b2_followups_moved, 2) * 4; // cap +8

  // TRACK C — Transformation (max 20)
  const C =
    (d.c1_body ? 5 : 0) +
    (d.c2_deepwork ? 5 : 0) +
    (d.c3_relationship ? 5 : 0) +
    (d.c4_macro_discipline ? 5 : 0);

  // TRACK D — Floor bonus (max 10)
  const floorHeld =
    d.a1_keystone &&
    (d.b1_new_prospects > 0 || d.b2_followups_moved > 0) &&
    d.c2_deepwork;
  const D = floorHeld ? 10 : 0;

  let total = A + B + C + D;
  let capped = false;

  // THE BUILD CAP — load-bearing, do not remove
  if (!d.a1_keystone && total > BUILD_CAP) {
    total = BUILD_CAP;
    capped = true;
  }

  total = Math.max(0, Math.min(100, total));

  return {
    total,
    floorHeld,
    breakdown: { A, B, C, D, capped },
  };
}
