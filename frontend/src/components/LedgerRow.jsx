export default function Row({ label, points, tone = "", index = 0 }) {
  return (
    <div className="row" style={{ "--i": index }}>
      <span className="row-label">{label}</span>
      <span className="leader" aria-hidden="true" />
      <span className={`row-points ${tone}`}>{points}</span>
    </div>
  );
}
