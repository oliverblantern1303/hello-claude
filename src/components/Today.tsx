import { useEffect, useMemo, useState } from "react";
import type { DayLog, StoreShape } from "../types";
import { EMPTY_DAY } from "../types";
import { score } from "../score";
import { computeStreak } from "../streak";
import { todayKey, addDays } from "../date";

type Props = {
  store: StoreShape;
  onSave: (key: string, day: DayLog) => void;
};

type ToggleProps = {
  on: boolean;
  onClick: () => void;
  variant?: "default" | "keystone" | "penalty";
  labelOn?: string;
  labelOff?: string;
};

function Toggle({
  on,
  onClick,
  variant = "default",
  labelOn = "Done",
  labelOff = "—",
}: ToggleProps) {
  const cls = [
    "toggle",
    on ? "on" : "",
    on && variant === "keystone" ? "keystone-on" : "",
    on && variant === "penalty" ? "penalty" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button
      className={cls}
      onClick={onClick}
      aria-pressed={on}
      type="button"
    >
      <span>{on ? labelOn : labelOff}</span>
    </button>
  );
}

type StepperProps = {
  value: number;
  cap: number;
  onChange: (n: number) => void;
};

function Stepper({ value, cap, onChange }: StepperProps) {
  const clamped = Math.max(0, value);
  return (
    <div className="stepper" aria-label={`Count, capped at ${cap}`}>
      <button onClick={() => onChange(Math.max(0, clamped - 1))} aria-label="Decrease">
        −
      </button>
      <span className="val">{clamped}</span>
      <button onClick={() => onChange(clamped + 1)} aria-label="Increase">
        +
      </button>
      <span className="cap">cap {cap}</span>
    </div>
  );
}

function defaultsFromYesterday(store: StoreShape, key: string): DayLog {
  const yKey = addDays(key, -1);
  const y = store.days[yKey];
  if (!y) return { ...EMPTY_DAY };
  // Prefill yesterday's pattern verbatim. Honesty lives in §6 definitions,
  // not in friction. The user must look at each row regardless.
  return { ...y };
}

export function Today({ store, onSave }: Props) {
  const key = todayKey();
  const existing = store.days[key];

  const [draft, setDraft] = useState<DayLog>(() =>
    existing ?? defaultsFromYesterday(store, key)
  );
  const [savedAck, setSavedAck] = useState(false);

  useEffect(() => {
    setDraft(existing ?? defaultsFromYesterday(store, key));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const result = useMemo(() => score(draft), [draft]);
  const streak = useMemo(() => computeStreak(store, key), [store, key]);

  // Detect a streak that just reset: yesterday's logged day was floor-broken
  const streakJustReset = useMemo(() => {
    const yKey = addDays(key, -1);
    const y = store.days[yKey];
    if (!y) return false;
    const r = score(y);
    return !r.floorHeld && streak.current === 0 && existing === undefined;
  }, [store, key, streak.current, existing]);

  const showPenaltyAck = draft.a3_preempt_discount;

  const floorState: "held" | "broken" | "unlogged" =
    existing === undefined && !hasAnyInput(draft)
      ? "unlogged"
      : result.floorHeld
      ? "held"
      : "broken";

  function update<K extends keyof DayLog>(k: K, v: DayLog[K]) {
    setDraft((d) => ({ ...d, [k]: v }));
    setSavedAck(false);
  }

  function saveNow() {
    onSave(key, draft);
    setSavedAck(true);
  }

  function minimumViableDay() {
    const next: DayLog = { ...EMPTY_DAY, a1_keystone: true };
    setDraft(next);
    onSave(key, next);
    setSavedAck(true);
  }

  return (
    <>
      <div className={`floor-banner ${floorState}`}>
        <div>
          <div className={`floor-state ${floorState}`}>
            {floorState === "held"
              ? "FLOOR HELD"
              : floorState === "broken"
              ? "FLOOR BROKEN"
              : "NOT YET LOGGED"}
          </div>
          <div className="floor-sub">
            {key} · {floorStateSubcopy(floorState, result.breakdown.capped)}
          </div>
        </div>
        <div className="score-block">
          <div>
            <span className="score-num">{result.total}</span>
            <span className="score-denom">/ 100</span>
          </div>
          {result.breakdown.capped && (
            <div className="score-cap-note">No ask · capped at 39</div>
          )}
        </div>
      </div>

      <div className="streak-row">
        <div>
          <span className="streak-num">{streak.current}</span>
          <span className="streak-label">Floors held in a row</span>
        </div>
        <div className="streak-best">
          Best · {streak.best}
        </div>
      </div>

      {streak.inWeekTwoWindow && (
        <div className="week2-note">
          This is where you usually quit. The system works only if it's boring.
          Boring is the point.
        </div>
      )}

      {streakJustReset && (
        <div className="reset-note">
          Streak reset. Floors are rebuilt, not mourned. Day 1.
        </div>
      )}

      {showPenaltyAck && (
        <div className="acknowledgment">
          Logged. Noticing it is how it stops.
        </div>
      )}

      <div className="tracks">
        {/* TRACK A — Closing */}
        <section className="track keystone">
          <header className="track-head">
            <h3 className="track-title">A · Closing</h3>
            <span className="track-meta">Track of record · max 50</span>
          </header>
          <div className="track-body">
            <div className="line">
              <div className="line-label">
                A1 — Keystone ask
                <small>
                  One message today that asked another human for a decision, a
                  meeting, or money. Not a "checking in." One counts.
                </small>
              </div>
              <div className="line-control">
                <Toggle
                  on={draft.a1_keystone}
                  variant="keystone"
                  onClick={() => update("a1_keystone", !draft.a1_keystone)}
                  labelOn="Asked"
                />
              </div>
            </div>

            <div className="line">
              <div className="line-label">
                A2 — Additional asks
                <small>+5 each, capped at +15.</small>
              </div>
              <div className="line-control">
                <Stepper
                  value={draft.a2_extra_asks}
                  cap={3}
                  onChange={(n) => update("a2_extra_asks", n)}
                />
              </div>
            </div>

            <div className="line">
              <div className="line-label">
                A3 — Price held under pressure
                <small>Quoted, defended, did not drop before pushed.</small>
              </div>
              <div className="line-control">
                <Toggle
                  on={draft.a3_price_hold}
                  onClick={() => update("a3_price_hold", !draft.a3_price_hold)}
                  labelOn="Held"
                />
              </div>
            </div>

            <div className="line">
              <div className="line-label">
                A3 — Preemptive discount
                <small>Discounted before pressure. −5. Log honestly.</small>
              </div>
              <div className="line-control">
                <Toggle
                  on={draft.a3_preempt_discount}
                  variant="penalty"
                  onClick={() =>
                    update("a3_preempt_discount", !draft.a3_preempt_discount)
                  }
                  labelOn="Logged · −5"
                />
              </div>
            </div>

            <div className="line">
              <div className="line-label">
                A4 — Demo / call / meeting held
                <small>Held, not booked.</small>
              </div>
              <div className="line-control">
                <Toggle
                  on={draft.a4_meeting_held}
                  onClick={() => update("a4_meeting_held", !draft.a4_meeting_held)}
                  labelOn="Held"
                />
              </div>
            </div>
          </div>
        </section>

        {/* TRACK B — Pipeline */}
        <section className="track">
          <header className="track-head">
            <h3 className="track-title">B · Pipeline</h3>
            <span className="track-meta">max 20</span>
          </header>
          <div className="track-body">
            <div className="line">
              <div className="line-label">
                B1 — New qualified prospects contacted
                <small>First touch. +4 each, capped at +12.</small>
              </div>
              <div className="line-control">
                <Stepper
                  value={draft.b1_new_prospects}
                  cap={3}
                  onChange={(n) => update("b1_new_prospects", n)}
                />
              </div>
            </div>
            <div className="line">
              <div className="line-label">
                B2 — Follow-ups that moved a deal
                <small>A reply received, a next step set. +4 each, cap +8.</small>
              </div>
              <div className="line-control">
                <Stepper
                  value={draft.b2_followups_moved}
                  cap={2}
                  onChange={(n) => update("b2_followups_moved", n)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* TRACK C — Transformation */}
        <section className="track">
          <header className="track-head">
            <h3 className="track-title">C · Transformation</h3>
            <span className="track-meta">max 20</span>
          </header>
          <div className="track-body">
            <div className="line">
              <div className="line-label">
                C1 — Body
                <small>Trained, walked, moved deliberately.</small>
              </div>
              <div className="line-control">
                <Toggle
                  on={draft.c1_body}
                  onClick={() => update("c1_body", !draft.c1_body)}
                />
              </div>
            </div>
            <div className="line">
              <div className="line-label">
                C2 — Deep work on the one important thing
                <small>
                  20+ min, phone in another room. Building-as-avoidance does not
                  count.
                </small>
              </div>
              <div className="line-control">
                <Toggle
                  on={draft.c2_deepwork}
                  onClick={() => update("c2_deepwork", !draft.c2_deepwork)}
                />
              </div>
            </div>
            <div className="line">
              <div className="line-label">
                C3 — Relationship
                <small>Genuine, present, non-transactional moment with partner.</small>
              </div>
              <div className="line-control">
                <Toggle
                  on={draft.c3_relationship}
                  onClick={() => update("c3_relationship", !draft.c3_relationship)}
                />
              </div>
            </div>
            <div className="line">
              <div className="line-label">
                C4 — Macro discipline
                <small>Did not lose the day to a geopolitical rabbit hole.</small>
              </div>
              <div className="line-control">
                <Toggle
                  on={draft.c4_macro_discipline}
                  onClick={() =>
                    update("c4_macro_discipline", !draft.c4_macro_discipline)
                  }
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="action-bar">
        <button className="btn" onClick={minimumViableDay} title="Logs only A1: send one ask.">
          Minimum viable day
        </button>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {!draft.a1_keystone && (
            <span className="cap-warning">No ask logged · day caps at 39</span>
          )}
          <button className="btn primary" onClick={saveNow}>
            {savedAck ? "Saved" : "Save day"}
          </button>
        </div>
      </div>
    </>
  );
}

function hasAnyInput(d: DayLog): boolean {
  return (
    d.a1_keystone ||
    d.a2_extra_asks > 0 ||
    d.a3_price_hold ||
    d.a3_preempt_discount ||
    d.a4_meeting_held ||
    d.b1_new_prospects > 0 ||
    d.b2_followups_moved > 0 ||
    d.c1_body ||
    d.c2_deepwork ||
    d.c3_relationship ||
    d.c4_macro_discipline
  );
}

function floorStateSubcopy(
  state: "held" | "broken" | "unlogged",
  capped: boolean
): string {
  if (state === "unlogged") return "Open day · log when ready";
  if (state === "held") return "Ask, pipeline, deep work — all three landed";
  if (capped) return "Building is invisible without an ask";
  return "Floor requires A1, B, and deep work";
}
