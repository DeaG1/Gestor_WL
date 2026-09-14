export interface SegOption<T extends string> {
  label: string;
  value: T;
}

interface SegProps<T extends string> {
  name: string;
  value: T;
  options: readonly (T | SegOption<T>)[];
  onChange: (value: T) => void;
}

export function Seg<T extends string>({ name, value, options, onChange }: SegProps<T>) {
  const normalized = options.map((o) =>
    typeof o === 'string' ? { label: o, value: o } : o);

  return (
    <div className="seg">
      {normalized.map((o) => (
        <label className="seg-opt" key={o.value}>
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
          />
          <span>{o.label}</span>
        </label>
      ))}
    </div>
  );
}
