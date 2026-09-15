import { createClient } from 'npm:@supabase/supabase-js@2';
import { nowHHMM, todayIso } from '../_shared/date.ts';
import { buildDigest, type DigestItem } from '../_shared/digest.ts';
import { shouldSend } from './eligibility.ts';

const URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON = Deno.env.get('SUPABASE_ANON_KEY')!;

// Supabase não injeta CORS nas Edge Functions — cada função cuida do seu.
// supabase.functions.invoke manda Authorization + Content-Type, o que força
// um preflight OPTIONS; sem esses headers o navegador bloqueia a chamada.
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });

interface ItemRow {
  name: string; wallet: string; type: string; chain: string;
  mint_time: string | null; cost: number | string | null; link: string;
}

const toDigestItem = (r: ItemRow): DigestItem => ({
  name: r.name,
  time: r.mint_time ? r.mint_time.slice(0, 5) : '',
  wallet: r.wallet,
  type: r.type,
  chain: r.chain,
  cost: r.cost === null ? null : Number(r.cost),
  link: r.link,
});

const postToDiscord = async (webhook: string, content: string): Promise<number> => {
  const res = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  return res.status;
};

const pendingOn = async (
  db: ReturnType<typeof createClient>,
  userId: string,
  day: string,
): Promise<ItemRow[]> => {
  const { data } = await db
    .from('wl_items')
    .select('name, wallet, type, chain, mint_time, cost, link')
    .eq('user_id', userId)
    .eq('mint_date', day)
    .eq('done', 'pendente')
    .order('mint_time', { ascending: true, nullsFirst: false });
  return (data ?? []) as ItemRow[];
};

/** Disparo do pg_cron: varre todo mundo que deve receber agora. */
const runCron = async (req: Request): Promise<Response> => {
  if (req.headers.get('Authorization') !== `Bearer ${SERVICE_ROLE}`) {
    return json({ error: 'não autorizado' }, 401);
  }

  const db = createClient(URL, SERVICE_ROLE);
  const day = todayIso();
  const hhmm = nowHHMM();
  let sent = 0;

  const { data: users } = await db
    .from('user_settings')
    .select('user_id, reminder_hour, discord_webhook, discord_on, currency')
    .eq('discord_on', true)
    .neq('discord_webhook', '');

  for (const u of users ?? []) {
    const { data: log } = await db
      .from('notification_log')
      .select('status, attempts')
      .eq('user_id', u.user_id).eq('day', day).eq('channel', 'discord')
      .maybeSingle();

    const eligible = shouldSend({
      discordOn: u.discord_on,
      webhook: u.discord_webhook,
      reminderHour: String(u.reminder_hour).slice(0, 5),
      nowHHMM: hhmm,
      log: log as { status: 'sending' | 'ok' | 'error'; attempts: number } | null,
    });
    if (!eligible) continue;

    const items = await pendingOn(db, u.user_id, day);
    if (!items.length) continue; // dia sem mint é silencioso

    // Reivindica antes de enviar. A chave composta impede dois envios.
    if (!log) {
      const { error } = await db.from('notification_log')
        .insert({ user_id: u.user_id, day, channel: 'discord', status: 'sending', attempts: 1 });
      if (error) continue; // outro tick chegou primeiro
    } else {
      await db.from('notification_log')
        .update({ status: 'sending', attempts: log.attempts + 1 })
        .eq('user_id', u.user_id).eq('day', day).eq('channel', 'discord');
    }

    const content = buildDigest(day, items.map(toDigestItem), u.currency);

    try {
      const status = await postToDiscord(u.discord_webhook, content);
      const ok = status >= 200 && status < 300;
      await db.from('notification_log')
        .update({
          status: ok ? 'ok' : 'error',
          error: ok ? null : `HTTP ${status}`,
          sent_at: ok ? new Date().toISOString() : null,
        })
        .eq('user_id', u.user_id).eq('day', day).eq('channel', 'discord');
      if (ok) sent++;
    } catch (e) {
      await db.from('notification_log')
        .update({ status: 'error', error: String(e) })
        .eq('user_id', u.user_id).eq('day', day).eq('channel', 'discord');
    }
  }

  return json({ ok: true, checked: users?.length ?? 0, sent });
};

/** Botão "Enviar agora": mesmo caminho, sem tocar no log do dia. */
const runTest = async (req: Request): Promise<Response> => {
  const auth = req.headers.get('Authorization');
  if (!auth) return json({ ok: false, status: 'sem sessão' }, 401);

  const db = createClient(URL, ANON, { global: { headers: { Authorization: auth } } });
  const { data: auth_ } = await db.auth.getUser();
  const user = auth_.user;
  if (!user) return json({ ok: false, status: 'sem sessão' }, 401);

  const { data: settings } = await db
    .from('user_settings')
    .select('discord_webhook, currency')
    .single();

  if (!settings?.discord_webhook) {
    return json({ ok: false, status: 'Cole o webhook primeiro.' }, 400);
  }

  const day = todayIso();
  const items = await pendingOn(db, user.id, day);
  const content = buildDigest(day, items.map(toDigestItem), settings.currency);
  const status = await postToDiscord(settings.discord_webhook, content);

  return json({ ok: status >= 200 && status < 300, status });
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: CORS });
  const body = await req.json().catch(() => ({}));
  return body?.mode === 'test' ? runTest(req) : runCron(req);
});
