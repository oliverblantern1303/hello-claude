import { useEffect, useState } from "react";
import type { DayLog, StoreShape } from "./types";
import { load, save, upsertDay, acceptHonesty } from "./storage";
import { Nav, type View } from "./components/Nav";
import { Today } from "./components/Today";
import { Week } from "./components/Week";
import { Arc } from "./components/Arc";
import { HonestyContract } from "./components/HonestyContract";

export default function App() {
  const [store, setStore] = useState<StoreShape>(() => load());
  const [view, setView] = useState<View>("today");

  useEffect(() => {
    save(store);
  }, [store]);

  function handleSave(key: string, day: DayLog) {
    setStore((s) => upsertDay(s, key, day));
  }

  function handleAcceptHonesty() {
    setStore((s) => acceptHonesty(s));
  }

  return (
    <div className="app">
      {!store.honestyAccepted && (
        <HonestyContract onAccept={handleAcceptHonesty} />
      )}

      <header className="header">
        <div>
          <span className="brand">THE FLOOR</span>
          <span className="brand-sub">closing & transformation panel</span>
        </div>
        <Nav view={view} onChange={setView} />
      </header>

      {view === "today" && <Today store={store} onSave={handleSave} />}
      {view === "week" && <Week store={store} />}
      {view === "arc" && <Arc store={store} />}
    </div>
  );
}
