-- Run once in Supabase > SQL Editor.
-- Visitors can only insert. Reading leads requires signing in to Supabase (or a service key).

create table if not exists public.leads (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text,
  interest text,
  timeframe text,
  message text,
  source text
);

create table if not exists public.post_reactions (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  slug text not null,
  kind text not null check (kind in ('helpful', 'saved', 'more'))
);

alter table public.leads enable row level security;
alter table public.post_reactions enable row level security;

-- Anyone can submit the contact form. Nobody anonymous can read it back.
create policy "public can submit leads" on public.leads
  for insert to anon with check (true);

-- Anyone can react and see reaction counts.
create policy "public can react" on public.post_reactions
  for insert to anon with check (true);
create policy "public can read reactions" on public.post_reactions
  for select to anon using (true);
