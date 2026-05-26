export type DayLog = {
  a1_keystone: boolean;
  a2_extra_asks: number;
  a3_price_hold: boolean;
  a3_preempt_discount: boolean;
  a4_meeting_held: boolean;
  b1_new_prospects: number;
  b2_followups_moved: number;
  c1_body: boolean;
  c2_deepwork: boolean;
  c3_relationship: boolean;
  c4_macro_discipline: boolean;
};

export type ScoreResult = {
  total: number;
  floorHeld: boolean;
  breakdown: {
    A: number;
    B: number;
    C: number;
    D: number;
    capped: boolean;
  };
};

export type StoreShape = {
  version: 1;
  honestyAccepted: boolean;
  days: Record<string, DayLog>;
};

export const EMPTY_DAY: DayLog = {
  a1_keystone: false,
  a2_extra_asks: 0,
  a3_price_hold: false,
  a3_preempt_discount: false,
  a4_meeting_held: false,
  b1_new_prospects: 0,
  b2_followups_moved: 0,
  c1_body: false,
  c2_deepwork: false,
  c3_relationship: false,
  c4_macro_discipline: false,
};
