-- ============================================
-- Ami-ru: Complete Database Schema
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── profiles ──
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_url text,
  pair_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── pairs ──
create table if not exists pairs (
  id uuid primary key default uuid_generate_v4(),
  name text not null default '',
  invite_code text unique,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- Add foreign key from profiles.pair_id to pairs.id
alter table profiles 
  add constraint profiles_pair_id_fkey 
  foreign key (pair_id) references pairs(id) on delete set null;

-- ── pantry_items (冷蔵庫) ──
create table if not exists pantry_items (
  id uuid primary key default uuid_generate_v4(),
  pair_id uuid not null references pairs(id) on delete cascade,
  name text not null,
  quantity text,
  category text,
  purchase_date date,
  expiry_date date,
  memo text,
  status text not null default 'active',
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── shopping_items (買い物リスト) ──
create table if not exists shopping_items (
  id uuid primary key default uuid_generate_v4(),
  pair_id uuid not null references pairs(id) on delete cascade,
  name text not null,
  quantity text,
  category text,
  is_purchased boolean not null default false,
  purchased_by uuid,
  source_pantry_id uuid references pantry_items(id) on delete set null,
  created_by uuid not null,
  created_at timestamptz not null default now()
);

-- ── calendar_events (予定) ──
create table if not exists calendar_events (
  id uuid primary key default uuid_generate_v4(),
  pair_id uuid not null references pairs(id) on delete cascade,
  title text not null,
  description text,
  is_all_day boolean not null default false,
  start_at timestamptz not null,
  end_at timestamptz,
  location text,
  source_place_id uuid,
  color text,
  assignee_id uuid,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── expenses (支出) ──
create table if not exists expenses (
  id uuid primary key default uuid_generate_v4(),
  pair_id uuid not null references pairs(id) on delete cascade,
  date date not null default current_date,
  amount integer not null,
  category text,
  payer_id uuid not null,
  bearer text,
  ratio_payer integer default 50,
  memo text,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── money_transactions (固定費・収入) ──
create table if not exists money_transactions (
  id uuid primary key default uuid_generate_v4(),
  pair_id uuid not null references pairs(id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  amount integer not null,
  category text,
  is_confirmed boolean not null default false,
  scheduled_date date,
  recurrence text,
  memo text,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── posts (掲示板) ──
create table if not exists posts (
  id uuid primary key default uuid_generate_v4(),
  pair_id uuid not null references pairs(id) on delete cascade,
  title text,
  body text not null,
  image_url text,
  tags text[] default '{}',
  is_pinned boolean not null default false,
  read_by uuid[] default '{}',
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── post_comments (コメント) ──
create table if not exists post_comments (
  id uuid primary key default uuid_generate_v4(),
  pair_id uuid not null references pairs(id) on delete cascade,
  post_id uuid not null references posts(id) on delete cascade,
  body text not null,
  created_by uuid not null,
  created_at timestamptz not null default now()
);

-- ── todos (タスク) ──
create table if not exists todos (
  id uuid primary key default uuid_generate_v4(),
  pair_id uuid not null references pairs(id) on delete cascade,
  title text not null,
  status text not null default 'pending',
  due_date date,
  assignee_id uuid,
  priority integer not null default 0,
  repeat_rule text,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── places (行きたいところ) ──
create table if not exists places (
  id uuid primary key default uuid_generate_v4(),
  pair_id uuid not null references pairs(id) on delete cascade,
  name text not null,
  url text,
  area text,
  tags text[] default '{}',
  memo text,
  status text not null default 'want',
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── mood_logs (気持ち記録) ──
create table if not exists mood_logs (
  id uuid primary key default uuid_generate_v4(),
  pair_id uuid not null references pairs(id) on delete cascade,
  mood integer not null,
  note text,
  created_by uuid not null,
  created_at timestamptz not null default now()
);

-- ── thanks_logs (ありがとう) ──
create table if not exists thanks_logs (
  id uuid primary key default uuid_generate_v4(),
  pair_id uuid not null references pairs(id) on delete cascade,
  message text,
  created_by uuid not null,
  created_at timestamptz not null default now()
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table pairs enable row level security;
alter table pantry_items enable row level security;
alter table shopping_items enable row level security;
alter table calendar_events enable row level security;
alter table expenses enable row level security;
alter table money_transactions enable row level security;
alter table posts enable row level security;
alter table post_comments enable row level security;
alter table todos enable row level security;
alter table places enable row level security;
alter table mood_logs enable row level security;
alter table thanks_logs enable row level security;

-- Helper function: get current user's pair_id
create or replace function get_my_pair_id()
returns uuid
language sql
stable
security definer
as $$
  select pair_id from profiles where id = auth.uid()
$$;

-- ── profiles policies ──
create policy "Users can view own profile"
  on profiles for select using (id = auth.uid());
create policy "Users can update own profile"
  on profiles for update using (id = auth.uid());
create policy "Users can view pair members"
  on profiles for select using (pair_id = get_my_pair_id());

-- ── pairs policies ──
create policy "Pair members can view their pair"
  on pairs for select using (id = get_my_pair_id());
create policy "Authenticated users can create pairs"
  on pairs for insert with check (auth.uid() is not null);
create policy "Pair members can update"
  on pairs for update using (id = get_my_pair_id());

-- Macro for pair-scoped tables
-- pantry_items
create policy "pair_read" on pantry_items for select using (pair_id = get_my_pair_id());
create policy "pair_insert" on pantry_items for insert with check (pair_id = get_my_pair_id());
create policy "pair_update" on pantry_items for update using (pair_id = get_my_pair_id());
create policy "pair_delete" on pantry_items for delete using (pair_id = get_my_pair_id());

-- shopping_items
create policy "pair_read" on shopping_items for select using (pair_id = get_my_pair_id());
create policy "pair_insert" on shopping_items for insert with check (pair_id = get_my_pair_id());
create policy "pair_update" on shopping_items for update using (pair_id = get_my_pair_id());
create policy "pair_delete" on shopping_items for delete using (pair_id = get_my_pair_id());

-- calendar_events
create policy "pair_read" on calendar_events for select using (pair_id = get_my_pair_id());
create policy "pair_insert" on calendar_events for insert with check (pair_id = get_my_pair_id());
create policy "pair_update" on calendar_events for update using (pair_id = get_my_pair_id());
create policy "pair_delete" on calendar_events for delete using (pair_id = get_my_pair_id());

-- expenses
create policy "pair_read" on expenses for select using (pair_id = get_my_pair_id());
create policy "pair_insert" on expenses for insert with check (pair_id = get_my_pair_id());
create policy "pair_update" on expenses for update using (pair_id = get_my_pair_id());
create policy "pair_delete" on expenses for delete using (pair_id = get_my_pair_id());

-- money_transactions
create policy "pair_read" on money_transactions for select using (pair_id = get_my_pair_id());
create policy "pair_insert" on money_transactions for insert with check (pair_id = get_my_pair_id());
create policy "pair_update" on money_transactions for update using (pair_id = get_my_pair_id());
create policy "pair_delete" on money_transactions for delete using (pair_id = get_my_pair_id());

-- posts
create policy "pair_read" on posts for select using (pair_id = get_my_pair_id());
create policy "pair_insert" on posts for insert with check (pair_id = get_my_pair_id());
create policy "pair_update" on posts for update using (pair_id = get_my_pair_id());
create policy "pair_delete" on posts for delete using (pair_id = get_my_pair_id());

-- post_comments
create policy "pair_read" on post_comments for select using (pair_id = get_my_pair_id());
create policy "pair_insert" on post_comments for insert with check (pair_id = get_my_pair_id());
create policy "pair_delete" on post_comments for delete using (pair_id = get_my_pair_id());

-- todos
create policy "pair_read" on todos for select using (pair_id = get_my_pair_id());
create policy "pair_insert" on todos for insert with check (pair_id = get_my_pair_id());
create policy "pair_update" on todos for update using (pair_id = get_my_pair_id());
create policy "pair_delete" on todos for delete using (pair_id = get_my_pair_id());

-- places
create policy "pair_read" on places for select using (pair_id = get_my_pair_id());
create policy "pair_insert" on places for insert with check (pair_id = get_my_pair_id());
create policy "pair_update" on places for update using (pair_id = get_my_pair_id());
create policy "pair_delete" on places for delete using (pair_id = get_my_pair_id());

-- mood_logs
create policy "pair_read" on mood_logs for select using (pair_id = get_my_pair_id());
create policy "pair_insert" on mood_logs for insert with check (pair_id = get_my_pair_id());

-- thanks_logs
create policy "pair_read" on thanks_logs for select using (pair_id = get_my_pair_id());
create policy "pair_insert" on thanks_logs for insert with check (pair_id = get_my_pair_id());

-- ============================================
-- Auto-create profile on signup
-- ============================================
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'display_name', ''),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

-- Drop if exists then create
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================
-- Indexes for performance
-- ============================================
create index if not exists idx_pantry_items_pair on pantry_items(pair_id);
create index if not exists idx_pantry_items_status on pantry_items(status);
create index if not exists idx_shopping_items_pair on shopping_items(pair_id);
create index if not exists idx_calendar_events_pair on calendar_events(pair_id);
create index if not exists idx_calendar_events_start on calendar_events(start_at);
create index if not exists idx_expenses_pair on expenses(pair_id);
create index if not exists idx_expenses_date on expenses(date);
create index if not exists idx_money_transactions_pair on money_transactions(pair_id);
create index if not exists idx_posts_pair on posts(pair_id);
create index if not exists idx_post_comments_post on post_comments(post_id);
create index if not exists idx_todos_pair on todos(pair_id);
create index if not exists idx_todos_status on todos(status);
create index if not exists idx_places_pair on places(pair_id);
create index if not exists idx_mood_logs_pair on mood_logs(pair_id);
create index if not exists idx_mood_logs_created on mood_logs(created_by, created_at);
create index if not exists idx_thanks_logs_pair on thanks_logs(pair_id);
