import { useEffect, type ReactNode } from 'react';

export const Dialog = ({
  onClose,
  width = 600,
  children,
}: {
  onClose: () => void;
  width?: number;
  children: ReactNode;
}) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="dialog-backdrop"
      style={{ zIndex: 50, backdropFilter: 'blur(3px)' }}
      onClick={onClose}
    >
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        style={{ width: `min(${width}px, 100%)` }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};
