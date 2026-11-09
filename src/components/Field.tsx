import { StatusBadge } from "./StatusBadge";

export function Field({
  label,
  name,
  value,
  confirmed,
  hint,
  type = "text",
  required = false,
  multiline = false,
}: {
  label: string;
  name: string;
  value: string;
  confirmed: boolean;
  hint?: string;
  type?: string;
  required?: boolean;
  multiline?: boolean;
}) {
  return (
    <div className="field">
      <div className="field-label">
        <label htmlFor={name}>{label}</label>
        <StatusBadge value={value} confirmed={confirmed} />
      </div>
      {multiline ? (
        <textarea id={name} name={name} defaultValue={value} rows={5} required={required} />
      ) : (
        <input id={name} name={name} type={type} defaultValue={value} required={required} />
      )}
      {value.trim() ? (
        <label className="check" htmlFor={`${name}_confirmed`}>
          <input
            id={`${name}_confirmed`}
            type="checkbox"
            name={`${name}_confirmed`}
            defaultChecked={confirmed}
          />
          Mark {label.toLowerCase()} confirmed
        </label>
      ) : (
        <p className="hint">Nothing is saved here yet.</p>
      )}
      {hint ? <p className="hint">{hint}</p> : null}
    </div>
  );
}
