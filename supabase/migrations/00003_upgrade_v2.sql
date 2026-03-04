-- ============================================
-- 00003: Ami-ru v2 upgrade
--   - calendar: color + assignee_id
--   - money_transactions: income & scheduled
--   - pairs: initial_balance
--   - posts: tags
--   - post_comments: comment thread
-- ============================================

-- ──────────────────────────────────────────
-- 1. CALENDAR: color + assignee_id
-- ──────────────────────────────────────────
alter table public.calendar_events
  add column if not exists color text default 'primary',
  add column if not exists assignee_id uuid references auth.users(id);

create index if not exists idx_calendar_events_assignee
  on public.calendar_events(assignee_id);

-- ──────────────────────────────────────────
-- 2. PAIRS: initial_balance
-- ──────────────────────────────────────────
alter table public.pairs
  add column if not exists initial_balance integer default 0;

-- ──────────────────────────────────────────
-- 3. MONEY_TRANSACTIONS
-- ──────────────────────────────────────────
create table if not exists public.money_transactions (
  id uuid primary key default uuid_generate_v4(),
  pair_id uuid not null references public.pairs(id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  amount integer not null,
  category text,
  is_confirmed boolean not null default true,
  scheduled_date date,
  recurrence text check (recurrence in ('none', 'monthly', 'yearly')),
  memo text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_money_transactions_pair_id
  on public.money_transactions(pair_id);
create index if not exists idx_money_transactions_date
  on public.money_transactions(scheduled_date);

alter table public.money_transactions enable row level security;

create policy "Pair members can select money_transactions"
  on public.money_transactions for select
  using (pair_id = public.get_user_pair_id());

create policy "Pair members can insert money_transactions"
  on public.money_transactions for insert
  with check (pair_id = public.get_user_pair_id() and created_by = auth.uid());

create policy "Pair members can update money_transactions"
  on public.money_transactions for update
  using (pair_id = public.get_user_pair_id());

create policy "Pair members can delete money_transactions"
  on public.money_transactions for delete
  using (pair_id = public.get_user_pair_id());

create trigger set_money_transactions_updated_at
  before update on public.money_transactions
  for each row execute function public.handle_updated_at();

-- ──────────────────────────────────────────
-- 4. POSTS: tags column
-- ──────────────────────────────────────────
alter table public.posts
  add column if not exists tags text[] default '{}';

-- ──────────────────────────────────────────
-- 5. POST_COMMENTS
-- ──────────────────────────────────────────
create table if not exists public.post_comments (
  id uuid primary key default uuid_generate_v4(),
  pair_id uuid not null references public.pairs(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  body text not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_post_comments_post_id
  on public.post_comments(post_id);
create index if not exists idx_post_comments_pair_id
  on public.post_comments(pair_id);

alter table public.post_comments enable row level security;

create policy "Pair members can select post_comments"
  on public.post_comments for select
  using (pair_id = public.get_user_pair_id());

create policy "Pair members can insert post_comments"
  on public.post_comments for insert
  with check (pair_id = public.get_user_pair_id() and created_by = auth.uid());

create policy "Pair members can update post_comments"
  on public.post_comments for update
  using (pair_id = public.get_user_pair_id());

create policy "Pair members can delete post_comments"
  on public.post_comments for delete
  using (pair_id = public.get_user_pair_id());

create trigger set_post_comments_updated_at
  before update on public.post_comments
  for each row execute function public.handle_updated_at();
