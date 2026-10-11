-- ─── Таблица заявок ───
create table public.leads (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 2 and 100),
  contact     text not null check (char_length(contact) between 5 and 100),
  service     text not null default 'Сайт'
              check (service in ('Сайт','Бот','Дизайн','Другое')),
  message     text not null check (char_length(message) between 10 and 2000),
  status      text not null default 'new'
              check (status in ('new','in_progress','done','cancelled')),
  source      text default 'website',          -- откуда пришла заявка
  user_agent  text,                             -- для аналитики
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─── Индексы для админки ───
create index idx_leads_status     on public.leads (status);
create index idx_leads_created_at on public.leads (created_at desc);

-- ─── Автообновление updated_at ───
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger trg_leads_updated_at
  before update on public.leads
  for each row execute function public.handle_updated_at();