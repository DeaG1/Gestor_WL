export const ErrorBanner = ({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) => (
  <div
    role="alert"
    style={{
      display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
      padding: 'var(--space-3) var(--space-4)', marginBottom: 'var(--space-6)',
      borderRadius: 'var(--radius-md)', fontSize: 14,
      background: 'oklch(0.40 0.10 25)', color: 'oklch(0.92 0.06 25)',
    }}
  >
    <span style={{ flex: 1 }}>{message}</span>
    <button className="btn btn-ghost" style={{ color: 'inherit' }} onClick={onDismiss}>
      Fechar
    </button>
  </div>
);
