import { useEffect, useState } from 'react';

/** Relógio do app: recalcula a cada 30 s, como o handoff pede. */
export const useNow = (): Date => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  return now;
};
