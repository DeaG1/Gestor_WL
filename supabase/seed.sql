-- As 30 WL da entrega, conforme design_handoff_gestor_wl/README.md.
-- Horários já em BRT; o horário original vai em notes. Ano = ano corrente.
-- Idempotente: não faz nada se o usuário já tiver qualquer WL.
-- Rode UMA vez, depois do primeiro login.

with me as (
  select id from auth.users where email = 'romulodoprado@gmail.com'
), y as (
  select extract(year from current_date)::int as yr
-- dt está em MM-DD, invertido em relação ao DD/MM do handoff, para bater com
-- make_date(ano, mês, dia) logo abaixo — ver "Cuidados conhecidos" no README.
), v(name, wallet, type, chain, dt, tm, status, notes) as (values
  ('Remilia: Civil War', 'Blowfly', 'FCFS',        'RH',  '09-08', '05:20', 'Confirmado', '4h20 EST'),
  ('ubk',                'Blowfly', 'FCFS',        'RH',  '',      '',      'TBH',        ''),
  ('Terminal Cats',      'Blowfly', 'GTD',         'RH',  '',      '',      'TBH',        ''),
  ('The Floks',          'Blowfly', 'GTD',         'RH',  '',      '',      'TBH',        '-$3'),
  ('Yield Farm',         'Blowfly', 'FCFS',        'RH',  '09-15', '',      'TBH',        ''),
  ('Kanz',               'Blowfly', 'FCFS',        'RH',  '',      '',      'TBH',        ''),
  ('Bright Brokers',     'Blowfly', 'FCFS',        'RH',  '09-09', '',      'TBH',        ''),
  ('Arc Brookies',       'Blowfly', 'FCFS',        'ARC', '',      '',      'TBH',        ''),
  ('AGNT.Social',        'Blowfly', 'GTD',         'RH',  '09-10', '10:00', 'Confirmado', '1pm UTC'),
  ('RichGirlsClub',      'Blowfly', 'GTD',         'ARC', '09-17', '',      'TBH',        ''),
  ('SotkcSalesman',      'Blowfly', 'FCFS',        'RH',  '',      '',      'TBH',        ''),
  ('Kashed',             'Blowfly', 'GTD',         'ARC', '',      '',      'TBH',        ''),
  ('Rowdies',            'Blowfly', 'GTD',         'RH',  '',      '',      'TBH',        ''),
  ('BoyMeetsHood',       'Blowfly', 'GTD',         'RH',  '',      '',      'TBH',        ''),
  ('Arcana',             'Blowfly', 'FCFS',        'ARC', '',      '',      'TBH',        ''),
  ('Rojak',              'Blowfly', '',            '',    '',      '',      'TBH',        ''),
  ('Mana Wizards',       'Blowfly', '',            '',    '',      '',      'TBH',        ''),
  ('The Alms',           'Blowfly', '',            '',    '',      '',      'TBH',        ''),
  ('Akai',               'MEGA',    'GTD',         '',    '09-23', '15:15', 'Confirmado', ''),
  ('Stock Salesman',     'MEGA',    'GTD',         '',    '',      '',      'TBH',        ''),
  ('Arc Machines',       'MEGA',    'GTD',         '',    '',      '',      'TBH',        'talvez 15/09'),
  ('Reeve',              'MEGA',    'FCFS',        '',    '',      '',      'TBH',        ''),
  ('Zec Punks',          'MEGA',    'GTD',         '',    '',      '',      'TBH',        ''),
  ('Broke Bookies',      'MEGA',    '',            '',    '',      '',      'TBA',        ''),
  ('Porkalus',           'MEGA',    'GTD',         '',    '',      '',      'TBA',        ''),
  ('Misfits',            'MEGA',    'GTD + FCFS',  '',    '09-16', '',      'TBH',        ''),
  ('Juicehedz',          'MEGA',    'FCFS',        '',    '',      '',      'TBH',        ''),
  ('Imprint',            'MEGA',    'FCFS',        '',    '',      '',      'TBH',        ''),
  ('Arc Chibi',          'MEGA',    '',            '',    '',      '',      'TBH',        ''),
  ('Fortune Foes',       'MEGA',    '',            '',    '09-15', '06:00', 'Confirmado', '6h da manhã')
)
insert into public.wl_items (user_id, name, wallet, type, chain, mint_date, mint_time, status, notes)
select
  me.id,
  v.name,
  v.wallet,
  v.type,
  v.chain,
  case when v.dt = '' then null
       else make_date(y.yr, split_part(v.dt, '-', 1)::int, split_part(v.dt, '-', 2)::int) end,
  nullif(v.tm, '')::time,
  v.status,
  v.notes
from me, y, v
where not exists (select 1 from public.wl_items w where w.user_id = me.id);
