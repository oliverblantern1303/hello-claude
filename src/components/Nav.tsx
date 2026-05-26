export type View = "today" | "week" | "arc";

type Props = {
  view: View;
  onChange: (v: View) => void;
};

export function Nav({ view, onChange }: Props) {
  return (
    <nav className="nav" aria-label="Primary">
      {(["today", "week", "arc"] as View[]).map((v) => (
        <button
          key={v}
          className={view === v ? "active" : ""}
          onClick={() => onChange(v)}
        >
          {v}
        </button>
      ))}
    </nav>
  );
}
