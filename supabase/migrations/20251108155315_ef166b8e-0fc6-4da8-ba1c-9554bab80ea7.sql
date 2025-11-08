-- Enum для ролей
create type public.app_role as enum ('admin', 'user');

-- Таблица профилей
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Таблица сценариев
create table public.scenarios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  full_text text not null,
  preview_text text not null,
  parameters jsonb not null,
  is_paid boolean default false,
  payment_id text,
  created_at timestamptz default now()
);

alter table public.scenarios enable row level security;

-- Таблица ролей
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- Security definer функция для проверки ролей
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- Триггер для автоматического создания профиля
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  
  insert into public.user_roles (user_id, role)
  values (new.id, 'user');
  
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS Policies для profiles
create policy "Users can view own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- RLS Policies для scenarios
create policy "Users can view own scenarios"
  on public.scenarios for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own scenarios"
  on public.scenarios for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete own scenarios"
  on public.scenarios for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "Admins can view all scenarios"
  on public.scenarios for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- RLS для user_roles
create policy "Users can view own roles"
  on public.user_roles for select
  to authenticated
  using (auth.uid() = user_id);

-- Индексы для производительности
create index scenarios_user_id_idx on public.scenarios(user_id);
create index scenarios_created_at_idx on public.scenarios(created_at desc);
create index user_roles_user_id_idx on public.user_roles(user_id);