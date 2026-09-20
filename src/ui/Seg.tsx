export interface SegOption<T extends string> {
  label: string;
  value: T;
}

interface SegProps<T extends string> {
  name: string;
  value: T;
  options: readonly (T | SegOption<T>)[];
  onChange: (value: T) => void;
  /**
   * Faz o grupo preencher a largura disponível, com as opções dividindo o
   * espaço por igual. É o que o protótipo aplica nos segmentados do modal
   * (`flex:1; justify-content:center`), onde cada grupo mora numa coluna de
   * grid: sem isso o grupo fica do tamanho do conteúdo e transborda a coluna.
   */
  stretch?: boolean;
  /** Espaçamento lateral de cada opção. O padrão do design system é 12px. */
  paddingInline?: number;
}

export function Seg<T extends string>({
  name, value, options, onChange, stretch = false, paddingInline,
}: SegProps<T>) {
  const normalized = options.map((o) =>
    typeof o === 'string' ? { label: o, value: o } : o);

  return (
    <div className="seg" style={stretch ? { display: 'flex', width: '100%' } : undefined}>
      {normalized.map((o) => (
        <label
          className="seg-opt"
          key={o.value}
          // nowrap sempre: um rótulo quebrado em duas linhas desalinha o grupo
          // inteiro e foi o que aconteceu com "GTD + FCFS".
          style={{
            whiteSpace: 'nowrap',
            ...(stretch ? { flex: 1, justifyContent: 'center' } : null),
            ...(paddingInline != null ? { paddingInline } : null),
          }}
        >
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
