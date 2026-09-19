import { useState } from 'react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { WD } from '@shared/date.ts';
import { calendarWeeks, monthTitle } from '../domain/calendar.ts';
import { itemView } from '../domain/item-view.ts';
import type { ScreenProps } from './actions.ts';
import { WTAG } from '../lib/tokens.ts';
import { WALLETS } from '../lib/types.ts';

interface CalMonth {
  y: number;
  m: number;
}

const monthOf = (day: string): CalMonth => {
  const [y, m] = day.split('-').map(Number);
  return { y, m: m - 1 };
};

const shiftMonth = (c: CalMonth, delta: number): CalMonth => {
  const d = new Date(c.y, c.m + delta, 1);
  return { y: d.getFullYear(), m: d.getMonth() };
};

export default function Calendario({ gestor, today, actions }: ScreenProps) {
  const [cal, setCal] = useState<CalMonth>(() => monthOf(today));
  const currency = gestor.settings.currency;

  const weeks = calendarWeeks(gestor.items, cal.y, cal.m, today);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <header style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-4)' }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>
            Calendário
          </div>
          <h1 style={{ fontSize: 34, margin: '4px 0 0', textTransform: 'capitalize' }}>
            {monthTitle(cal.y, cal.m)}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-1)', marginLeft: 'auto' }}>
          <button className="btn btn-secondary btn-icon" onClick={() => setCal((c) => shiftMonth(c, -1))}>
            <CaretLeft size={16} />
          </button>
          <button className="btn btn-secondary" onClick={() => setCal(monthOf(today))}>Hoje</button>
          <button className="btn btn-secondary btn-icon" onClick={() => setCal((c) => shiftMonth(c, 1))}>
            <CaretRight size={16} />
          </button>
        </div>
      </header>

      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,minmax(0,1fr))', gap: 6, marginBottom: 6 }}>
          {WD.map((w) => (
            <div
              key={w}
              style={{ fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--color-neutral-500)', padding: '0 8px' }}
            >
              {w}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {weeks.map((wk) => (
            <div key={wk.days[0].day} style={{ display: 'grid', gridTemplateColumns: 'repeat(7,minmax(0,1fr))', gap: 6 }}>
              {wk.days.map((d) => (
                <div
                  key={d.day}
                  style={{
                    minHeight: 110, padding: 8, borderRadius: 'var(--radius-md)',
                    background: 'var(--color-surface)', opacity: d.inMonth ? 1 : 0.35,
                    boxShadow: d.isToday ? 'inset 0 0 0 1px var(--color-accent)' : 'var(--shadow-sm)',
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 500, color: d.numColor, marginBottom: 6 }}>
                    {d.num}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {d.items.map((item) => {
                      const view = itemView(item, currency);
                      return (
                        <button
                          key={item.id}
                          onClick={() => actions.edit(item)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 5, width: '100%', textAlign: 'left',
                            background: view.calBg, border: 0, padding: '3px 6px', borderRadius: 'var(--radius-sm)',
                            font: 'inherit', fontSize: 11, lineHeight: 1.3, color: 'var(--color-text)',
                            cursor: 'pointer', opacity: view.opacity,
                          }}
                        >
                          <span style={{ color: 'var(--color-neutral-400)', flex: 'none' }}>{view.timeShort}</span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                            {item.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-6)', fontSize: 12, color: 'var(--color-neutral-400)' }}>
        {WALLETS.map((w) => (
          <span key={w} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: WTAG[w][0] }} />
            {w}
          </span>
        ))}
      </div>
    </div>
  );
}
