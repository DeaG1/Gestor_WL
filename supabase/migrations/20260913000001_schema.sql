create extension if not exists pgcrypto;

create table public.wl_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name       text not null constraint wl_items_name_check  check (length(trim(name)) > 0),
  wallet     text not null constraint wl_items_wallet_check check (wallet in ('Blowfly','MEGA')),
  type       text not null default ''   constraint wl_items_type_check   check (type   in ('FCFS','GTD','GTD + FCFS','')),
  chain      text not null default ''   constraint wl_items_chain_check  check (chain  in ('RH','ARC','')),
  mint_date  date,
  mint_time  time,
  status     text not null default 'TBH' constraint wl_items_status_check check (status in ('Confirmado','TBH','TBA')),
  cost       numeric,
  sold       numeric,
  supply     integer,
  link       text not null default '',
  notes      text not null default '',
  done       text not null default 'pendente' constraint wl_items_done_check check (done in ('pendente','mintado','pulado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index wl_items_user_date_idx on public.wl_items (user_id, mint_date);

create table public.user_settings (
  user_id         uuid primary key references auth.users(id) on delete cascade,
  reminder_hour   time    not null default '08:00',
  discord_webhook text    not null default '',
  discord_on      boolean not null default true,
  pc_on           boolean not null default false,
  currency        text    not null default '$'    constraint user_settings_currency_check   check (currency   in ('$','R$','ETH','SOL')),
  start_view      text    not null default 'dash' constraint user_settings_start_view_check check (start_view in ('dash','hoje','lista','cal','notif')),
  show_past       boolean not null default true,
  updated_at      timestamptz not null default now()
);

create table public.notification_log (
  user_id  uuid not null references auth.users(id) on delete cascade,
  day      date not null,
  channel  text not null constraint notification_log_channel_check check (channel in ('discord')),
  status   text not null constraint notification_log_status_check  check (status in ('sending','ok','error')),
  attempts integer not null default 0,
  error    text,
  sent_at  timestamptz,
  constraint notification_log_pkey primary key (user_id, day, channel)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger wl_items_set_updated_at
  before update on public.wl_items
  for each row execute function public.set_updated_at();

create trigger user_settings_set_updated_at
  before update on public.user_settings
  for each row execute function public.set_updated_at();
