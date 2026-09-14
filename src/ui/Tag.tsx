import type { ReactNode } from 'react';

export const Tag = ({ bg, fg, children }: { bg: string; fg: string; children: ReactNode }) => (
  <span className="tag" style={{ background: bg, color: fg }}>{children}</span>
);

export const TagOutline = ({ children }: { children: ReactNode }) => (
  <span className="tag tag-outline">{children}</span>
);
