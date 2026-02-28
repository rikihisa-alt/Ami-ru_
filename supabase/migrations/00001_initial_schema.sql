-- ============================================
-- 0. EXTENSIONS
-- ============================================
create extension if not exists "uuid-ossp";

-- ============================================
-- 1. PROFILES (mirrors auth.users)
-- ============================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_url text,
  pair_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_pair_id on public.profiles(pair_id);

-- ============================================
-- 2. PAIRS
-- ============================================
create table public.pairs (
  id uuid primary key default uuid_generate_v4(),
  invite_code text unique not null default encode(gen_random_bytes(6), 'hex'),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

-- ============================================
-- 3. PAIR INVITES
-- ============================================
create table public.pair_invites (
  id uuid primary key default uuid_generate_v4(),
  pair_id uuid not null references public.pairs(id) on delete cascade,
  invited_by uuid not null references auth.users(id),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'expired')),
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now()
);

-- FK from profiles to pairs (deferred because pairs table wasn't created yet)
alter table public.profiles
  add constraint fk_profiles_pair
  foreign key (pair_id) references public.pairs(id) on delete set null;

-- ============================================
-- 4. HELPER FUNCTION for RLS
-- ============================================
create or replace function public.get_user_pair_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select pair_id from public.profiles where id = auth.uid()
$$;

-- ============================================
-- 5. PANTRY ITEMS
-- ============================================
create table public.pantry_items (
  id uuid primary key default uuid_generate_v4(),
  pair_id uuid not null references public.pairs(id) on delete cascade,
  name text not null,
  quantity text,
  category text,
  purchase_date date,
  expiry_date date,
  memo text,
  status text not null default 'active' check (status in ('active', 'consumed', 'discarded')),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_pantry_items_pair_id on public.pantry_items(pair_id);
create index idx_pantry_items_expiry on public.pantry_items(expiry_date) where status = 'active';

-- ============================================
-- 6. SHOPPING ITEMS
-- ============================================
create table public.shopping_items (
  id uuid primary key default uuid_generate_v4(),
  pair_id uuid not null references public.pairs(id) on delete cascade,
  name text not null,
  quantity text,
  category text,
  is_purchased boolean not null default false,
  purchased_by uuid references auth.users(id),
  source_pantry_id uuid references public.pantry_items(id) on delete set null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_shopping_items_pair_id on public.shopping_items(pair_id);

-- ============================================
-- 7. CALENDAR EVENTS
-- ============================================
create table public.calendar_events (
  id uuid primary key default uuid_generate_v4(),
  pair_id uuid not null references public.pairs(id) on delete cascade,
  title text not null,
  description text,
  is_all_day boolean not null default false,
  start_at timestamptz not null,
  end_at timestamptz,
  location text,
  source_place_id uuid,
  participants text[] default '{}',
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_calendar_events_pair_id on public.calendar_events(pair_id);
create index idx_calendar_events_start on public.calendar_events(start_at);

-- ============================================
-- 8. EXPENSES
-- ============================================
create table public.expenses (
  id uuid primary key default uuid_generate_v4(),
  pair_id uuid not null references public.pairs(id) on delete cascade,
  date date not null default current_date,
  amount integer not null,
  category text,
  payer_id uuid not null references auth.users(id),
  bearer text not null default 'shared' check (bearer in ('payer', 'partner', 'shared')),
  ratio_payer smallint not null default 50 check (ratio_payer between 0 and 100),
  memo text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_expenses_pair_id on public.expenses(pair_id);
create index idx_expenses_date on public.expenses(date);

-- ============================================
-- 9. POSTS (Bulletin Board)
-- ============================================
create table public.posts (
  id uuid primary key default uuid_generate_v4(),
  pair_id uuid not null references public.pairs(id) on delete cascade,
  title text,
  body text not null,
  image_url text,
  is_pinned boolean not null default false,
  read_by uuid[] default '{}',
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_posts_pair_id on public.posts(pair_id);

-- ============================================
-- 10. TODOS
-- ============================================
create table public.todos (
  id uuid primary key default uuid_generate_v4(),
  pair_id uuid not null references public.pairs(id) on delete cascade,
  title text not null,
  due_date date,
  assignee_id uuid references auth.users(id),
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'done')),
  priority smallint default 0,
  repeat_rule text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_todos_pair_id on public.todos(pair_id);
create index idx_todos_due_date on public.todos(due_date) where status != 'done';

-- ============================================
-- 11. PLACES
-- ============================================
create table public.places (
  id uuid primary key default uuid_generate_v4(),
  pair_id uuid not null references public.pairs(id) on delete cascade,
  name text not null,
  url text,
  area text,
  tags text[] default '{}',
  memo text,
  status text not null default 'want_to_go' check (status in ('want_to_go', 'candidate', 'visited')),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_places_pair_id on public.places(pair_id);

-- FK from calendar_events to places
alter table public.calendar_events
  add constraint fk_calendar_events_source_place
  foreign key (source_place_id) references public.places(id) on delete set null;

-- ============================================
-- 12. RLS POLICIES
-- ============================================
alter table public.profiles enable row level security;
alter table public.pairs enable row level security;
alter table public.pair_invites enable row level security;
alter table public.pantry_items enable row level security;
alter table public.shopping_items enable row level security;
alter table public.calendar_events enable row level security;
alter table public.expenses enable row level security;
alter table public.posts enable row level security;
alter table public.todos enable row level security;
alter table public.places enable row level security;

-- PROFILES
create policy "Users can view own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Users can view partner profile"
  on public.profiles for select
  using (pair_id = public.get_user_pair_id() and public.get_user_pair_id() is not null);

create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid());

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (id = auth.uid());

-- PAIRS
create policy "Pair members can view pair"
  on public.pairs for select
  using (id = public.get_user_pair_id());

create policy "Authenticated users can create pairs"
  on public.pairs for insert
  with check (auth.uid() = created_by);

-- PAIR_INVITES
create policy "Invite creator can view"
  on public.pair_invites for select
  using (invited_by = auth.uid() or pair_id = public.get_user_pair_id());

create policy "Pair members can create invites"
  on public.pair_invites for insert
  with check (pair_id = public.get_user_pair_id());

create policy "Pair invites can be updated"
  on public.pair_invites for update
  using (pair_id = public.get_user_pair_id() or invited_by = auth.uid());

-- GENERIC pair-scoped policies for data tables
do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'pantry_items', 'shopping_items', 'calendar_events',
    'expenses', 'posts', 'todos', 'places'
  ] loop
    execute format('
      create policy "Pair members can select %1$s"
        on public.%1$s for select
        using (pair_id = public.get_user_pair_id());
    ', tbl);

    execute format('
      create policy "Pair members can insert %1$s"
        on public.%1$s for insert
        with check (pair_id = public.get_user_pair_id() and created_by = auth.uid());
    ', tbl);

    execute format('
      create policy "Pair members can update %1$s"
        on public.%1$s for update
        using (pair_id = public.get_user_pair_id());
    ', tbl);

    execute format('
      create policy "Pair members can delete %1$s"
        on public.%1$s for delete
        using (pair_id = public.get_user_pair_id());
    ', tbl);
  end loop;
end $$;

-- ============================================
-- 13. TRIGGERS: auto-update updated_at
-- ============================================
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'profiles', 'pantry_items', 'shopping_items', 'calendar_events',
    'expenses', 'posts', 'todos', 'places'
  ] loop
    execute format('
      create trigger set_updated_at
        before update on public.%1$s
        for each row execute function public.handle_updated_at();
    ', tbl);
  end loop;
end $$;

-- ============================================
-- 14. TRIGGER: auto-create profile on signup
-- ============================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- 15. FUNCTION: join pair by invite code
-- ============================================
create or replace function public.join_pair_by_code(code text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  target_pair_id uuid;
  current_pair uuid;
  member_count int;
begin
  select pair_id into current_pair from profiles where id = auth.uid();
  if current_pair is not null then
    return json_build_object('error', 'already_in_pair');
  end if;

  select id into target_pair_id from pairs where invite_code = code;
  if target_pair_id is null then
    return json_build_object('error', 'invalid_code');
  end if;

  select count(*) into member_count from profiles where pair_id = target_pair_id;
  if member_count >= 2 then
    return json_build_object('error', 'pair_full');
  end if;

  update profiles set pair_id = target_pair_id where id = auth.uid();

  return json_build_object('success', true, 'pair_id', target_pair_id);
end;
$$;

-- ============================================
-- 16. FUNCTION: create pair
-- ============================================
create or replace function public.create_pair()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  current_pair uuid;
  new_pair_id uuid;
  new_invite_code text;
begin
  select pair_id into current_pair from profiles where id = auth.uid();
  if current_pair is not null then
    return json_build_object('error', 'already_in_pair');
  end if;

  insert into pairs (created_by)
  values (auth.uid())
  returning id, invite_code into new_pair_id, new_invite_code;

  update profiles set pair_id = new_pair_id where id = auth.uid();

  return json_build_object('success', true, 'pair_id', new_pair_id, 'invite_code', new_invite_code);
end;
$$;
