type Props = { onAccept: () => void };

export function HonestyContract({ onAccept }: Props) {
  return (
    <div className="contract-backdrop">
      <div className="contract" role="dialog" aria-modal="true">
        <h2>One condition.</h2>
        <p>
          This panel only works if A1 (the keystone ask) and A3 (the price hold,
          or the preemptive discount) are logged truthfully.
        </p>
        <p>
          It has no audience but you. Lying to it is lying to yourself, and a
          score earned by self-deception is the most expensive thing here.
        </p>
        <p className="dim">
          This screen will not appear again. The instrument is silent from here.
        </p>
        <div className="contract-actions">
          <button className="btn primary" onClick={onAccept}>
            Acknowledged
          </button>
        </div>
      </div>
    </div>
  );
}
