import { useMemo } from "react";
import type { StoreShape } from "../types";
import { score } from "../score";
import { weeksBack } from "../date";

type Props = { store: StoreShape };

const WEEKS = 12;

export function Arc({ store }: Props) {
  const data = useMemo(() => {
    const weeks = weeksBack(WEEKS);
    let cumPriceHolds = 0;
    let cumAsks = 0;
    const rows = weeks.map((days, idx) => {
      let floorsHeld = 0;
      let asks = 0;
      let priceHolds = 0;
      for (const k of days) {
        const d = store.days[k];
        if (!d) continue;
        const r = score(d);
        if (r.floorHeld) floorsHeld += 1;
        if (d.a1_keystone) asks += 1;
        asks += d.a2_extra_asks;
        if (d.a3_price_hold) priceHolds += 1;
      }
      cumPriceHolds += priceHolds;
      cumAsks += asks;
      return {
        idx,
        label: weekLabel(days),
        floorsHeld,
        asks,
        priceHolds,
        cumPriceHolds,
        cumAsks,
      };
    });
    return rows;
  }, [store]);

  const maxFloors = Math.max(1, ...data.map((r) => r.floorsHeld));
  const totalAsks = data.length ? data[data.length - 1].cumAsks : 0;
  const totalPriceHolds = data.length ? data[data.length - 1].cumPriceHolds : 0;

  return (
    <>
      <section className="section">
        <h3 className="section-title">Floor-held days per week · {WEEKS} weeks</h3>
        <div className="bar-chart" style={{ ["--cols" as never]: WEEKS }}>
          {data.map((r) => (
            <div className="bar-col" key={r.idx} title={`${r.label}: ${r.floorsHeld}/7`}>
              <div
                className="bar"
                style={{ height: `${(r.floorsHeld / maxFloors) * 100}%` }}
              />
            </div>
          ))}
        </div>
        <div className="bar-axis" style={{ ["--cols" as never]: WEEKS }}>
          {data.map((r) => (
            <div key={r.idx}>{r.label}</div>
          ))}
        </div>
        <div style={{ marginTop: 14, color: "var(--text-dim)", fontSize: 12 }}>
          The only question that matters: is the frequency of selling trending up?
        </div>
      </section>

      <section className="section">
        <h3 className="section-title">Cumulative · the transformation evidence</h3>
        <div className="cum-grid">
          <div className="stat">
            <div className="stat-label">Total asks</div>
            <div className="stat-value">{totalAsks}</div>
            <div className="stat-detail">Across the last {WEEKS} weeks.</div>
          </div>
          <div className="stat">
            <div className="stat-label">Total price holds</div>
            <div className="stat-value">{totalPriceHolds}</div>
            <div className="stat-detail">Times you didn't fold first.</div>
          </div>
        </div>
      </section>
    </>
  );
}

function weekLabel(days: string[]): string {
  // Use the Monday (day 0) as the label, formatted M/D
  const [y, m, d] = days[0].split("-").map(Number);
  void y;
  return `${m}/${d}`;
}
