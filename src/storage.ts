import type { StoreShape, DayLog } from "./types";

const KEY = "the-floor/v1";

const EMPTY_STORE: StoreShape = {
  version: 1,
  honestyAccepted: false,
  days: {},
};

export function load(): StoreShape {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY_STORE };
    const parsed = JSON.parse(raw) as StoreShape;
    if (parsed.version !== 1) return { ...EMPTY_STORE };
    return parsed;
  } catch {
    return { ...EMPTY_STORE };
  }
}

export function save(store: StoreShape): void {
  localStorage.setItem(KEY, JSON.stringify(store));
}

export function upsertDay(
  store: StoreShape,
  dateKey: string,
  day: DayLog
): StoreShape {
  return {
    ...store,
    days: { ...store.days, [dateKey]: day },
  };
}

export function acceptHonesty(store: StoreShape): StoreShape {
  return { ...store, honestyAccepted: true };
}
