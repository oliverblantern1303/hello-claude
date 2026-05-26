export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(key: string, n: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + n);
  return todayKey(dt);
}

export function shortDow(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dt.getDay()];
}

export function lastNDays(n: number, end: string = todayKey()): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(addDays(end, -i));
  return out;
}

export function weeksBack(n: number, end: string = todayKey()): string[][] {
  // returns n weeks ending at the week containing `end`, each as an array of 7 day keys (Mon..Sun)
  const [y, m, d] = end.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  // find Monday of current week
  const dow = dt.getDay(); // 0 = Sun
  const offsetToMon = dow === 0 ? -6 : 1 - dow;
  const mondayKey = addDays(end, offsetToMon);
  const weeks: string[][] = [];
  for (let w = n - 1; w >= 0; w--) {
    const wStart = addDays(mondayKey, -w * 7);
    const days: string[] = [];
    for (let i = 0; i < 7; i++) days.push(addDays(wStart, i));
    weeks.push(days);
  }
  return weeks;
}
