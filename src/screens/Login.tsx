import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase.ts';
import { Field } from '../ui/Field.tsx';
import { walletNames } from '../domain/wallet-cards.ts';

type Status = 'idle' | 'sending' | 'sent';

export default function Login() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    if (signInError) {
      setError(signInError.message);
      setStatus('idle');
      return;
    }
    setStatus('sent');
  };

  return (
    <div className="wl-login">
      <div style={{ width: 340 }}>
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{
            fontFamily: 'var(--font-heading)', fontWeight: 500, fontSize: 20, letterSpacing: '-0.01em',
          }}
          >
            Gestor WL
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-neutral-500)', marginTop: 2 }}>
            FCFS · GTD · {walletNames()}
          </div>
        </div>

        {status === 'sent' ? (
          <p style={{ fontSize: 14, color: 'var(--color-neutral-400)' }}>
            Link enviado — confere seu e-mail.
          </p>
        ) : (
          <form onSubmit={(e) => { void onSubmit(e); }}>
            <Field label="E-mail">
              {(id) => (
                <input
                  id={id}
                  className="input"
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              )}
            </Field>
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={status === 'sending'}
            >
              {status === 'sending' ? 'Enviando…' : 'Enviar link de acesso'}
            </button>
            {error && (
              <p style={{ fontSize: 13, color: 'oklch(0.92 0.06 25)', marginTop: 'var(--space-2)' }}>
                {error}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
