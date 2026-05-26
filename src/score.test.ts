import { describe, it, expect } from "vitest";
import { score, BUILD_CAP } from "./score";
import { EMPTY_DAY } from "./types";
import type { DayLog } from "./types";

const day = (overrides: Partial<DayLog> = {}): DayLog => ({
  ...EMPTY_DAY,
  ...overrides,
});

describe("score()", () => {
  it("empty day scores 0 and is floor-broken", () => {
    const r = score(EMPTY_DAY);
    expect(r.total).toBe(0);
    expect(r.floorHeld).toBe(false);
  });

  it("full building day with zero asks caps at 39 and shows floor broken", () => {
    // every non-A1 metric maxed; A1 stays false
    const r = score(
      day({
        a2_extra_asks: 99,
        a3_price_hold: true,
        a4_meeting_held: true,
        b1_new_prospects: 99,
        b2_followups_moved: 99,
        c1_body: true,
        c2_deepwork: true,
        c3_relationship: true,
        c4_macro_discipline: true,
      })
    );
    expect(r.total).toBeLessThanOrEqual(BUILD_CAP);
    expect(r.total).toBe(BUILD_CAP);
    expect(r.breakdown.capped).toBe(true);
    expect(r.floorHeld).toBe(false);
  });

  it("a single keystone ask alone does not hold the floor (needs B + C2)", () => {
    const r = score(day({ a1_keystone: true }));
    expect(r.total).toBe(20);
    expect(r.floorHeld).toBe(false);
  });

  it("a1 + b1 + c2_deepwork holds the floor", () => {
    const r = score(
      day({ a1_keystone: true, b1_new_prospects: 1, c2_deepwork: true })
    );
    expect(r.floorHeld).toBe(true);
    // 20 (A1) + 4 (B1) + 5 (C2) + 10 (D floor bonus) = 39
    expect(r.total).toBe(39);
  });

  it("a1 + b2_followup + c2_deepwork also holds the floor", () => {
    const r = score(
      day({ a1_keystone: true, b2_followups_moved: 1, c2_deepwork: true })
    );
    expect(r.floorHeld).toBe(true);
  });

  it("a2 asks cap at +15 (3 extra)", () => {
    const r = score(day({ a1_keystone: true, a2_extra_asks: 10 }));
    // 20 + 15 = 35
    expect(r.total).toBe(35);
  });

  it("preemptive discount applies a −5 penalty, never below 0 for track A", () => {
    const r = score(day({ a3_preempt_discount: true }));
    // Track A clamped to 0, total = 0, but A1=false so no cap needed
    expect(r.breakdown.A).toBe(0);
    expect(r.total).toBe(0);
  });

  it("price hold + held floor sums correctly", () => {
    const r = score(
      day({
        a1_keystone: true,
        a3_price_hold: true,
        a4_meeting_held: true,
        b1_new_prospects: 2,
        b2_followups_moved: 1,
        c1_body: true,
        c2_deepwork: true,
        c3_relationship: true,
        c4_macro_discipline: true,
      })
    );
    // A: 20 + 0 + 10 + 5 = 35
    // B: 2*4 + 1*4 = 12
    // C: 20
    // D: 10
    // total: 77
    expect(r.breakdown.A).toBe(35);
    expect(r.breakdown.B).toBe(12);
    expect(r.breakdown.C).toBe(20);
    expect(r.breakdown.D).toBe(10);
    expect(r.total).toBe(77);
    expect(r.floorHeld).toBe(true);
  });

  it("maximum legal day is 100", () => {
    const r = score(
      day({
        a1_keystone: true,
        a2_extra_asks: 3,
        a3_price_hold: true,
        a3_preempt_discount: false,
        a4_meeting_held: true,
        b1_new_prospects: 3,
        b2_followups_moved: 2,
        c1_body: true,
        c2_deepwork: true,
        c3_relationship: true,
        c4_macro_discipline: true,
      })
    );
    expect(r.total).toBe(100);
    expect(r.floorHeld).toBe(true);
  });

  it("caps b1 at +12 and b2 at +8", () => {
    const r = score(
      day({ a1_keystone: true, b1_new_prospects: 50, b2_followups_moved: 50 })
    );
    // A: 20, B: 12+8=20, no C, no D (no c2)
    expect(r.breakdown.B).toBe(20);
  });
});
