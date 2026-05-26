import { useMemo } from "react";
import type { StoreShape } from "../types";
import { score } from "../score";
import { computeStreak } from "../streak";
import { lastNDays, shortDow, todayKey } from "../date";

type Props = { store: StoreShape };

export function Week({ store }: Props) {
  const days = useMemo(() => lastNDays(7), []);
  const today = todayKey();

  let asksTotal = 0;
  let loggedDays = 0;
  let priceHolds = 0;
  let preemptDiscounts = 0;
  let floorHeldCount = 0;

  for (const k of days) {
    const d = store.days[k];
    if (!d) continue;
    loggedDays += 1;
    if (d.a1_keystone) asksTotal += 1;
    asksTotal += d.a2_extra_asks;
    if (d.a3_price_hold) priceHolds += 1;
    if (d.a3_preempt_discount) preemptDiscounts += 1;
    const r = score(d);
    if (r.floorHeld) floorHeldCount += 1;
  }

  const ratio =
    loggedDays === 0 ? "0.0" : (asksTotal / loggedDays).toFixed(1);

  const streak = useMemo(() => computeStreak(store, today), [store, today]);

  return (
    <>
      <section className="section">
        <h3 className="section-title">Last 7 days · floor</h3>
        <div className="week-strip">
          {days.map((k) => {
            const d = store.days[k];
            let state: "held" | "broken" | "unlogged" = "unlogged";
            if (d) state = score(d).floorHeld ? "held" : "broken";
            return (
              <div
                key={k}
                className={`day-cell ${state} ${k === today ? "today" : ""}`}
              >
                <div className="dow">{shortDow(k)}</div>
                <div className="mark">
                  {state === "held" ? "●" : state === "broken" ? "○" : "·"}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 12, color: "var(--text-dim)", fontSize: 12 }}>
          {floorHeldCount}/7 floors held
        </div>
      </section>

      <section className="section">
        <h3 className="section-title">Diagnostic ratios</h3>
        <div className="stat-grid">
          <div className="stat">
            <div className="stat-label">Asks per logged day</div>
            <div className="stat-value">{ratio}</div>
            <div className="stat-detail">
              {asksTotal} asks across {loggedDays} day{loggedDays === 1 ? "" : "s"}.
              The truth-teller.
            </div>
          </div>
          <div className="stat">
            <div className="stat-label">Price · holds vs discounts</div>
            <div className="stat-value">
              {priceHolds}
              <span className="sep">/</span>
              {preemptDiscounts}
            </div>
            <div className="stat-detail">
              Personal scoreboard. Held vs preemptively dropped.
            </div>
          </div>
          <div className="stat">
            <div className="stat-label">Streak · current / best</div>
            <div className="stat-value">
              {streak.current}
              <span className="sep">/</span>
              {streak.best}
            </div>
            <div className="stat-detail">
              Consecutive floor-held days.
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
