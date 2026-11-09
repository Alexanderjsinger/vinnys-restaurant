export function StatusBadge({ value, confirmed }: { value: string; confirmed: boolean }) {
  if (!value.trim()) return <span className="badge badge-muted">Not set</span>;
  if (!confirmed) return <span className="badge badge-warn">Unconfirmed</span>;
  return <span className="badge badge-ok">Confirmed</span>;
}
