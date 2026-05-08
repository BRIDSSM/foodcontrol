-- Enums
create type product_category as enum (
  'laticinios', 'graos', 'bebidas', 'carnes',
  'congelados', 'hortifruti', 'padaria', 'enlatados',
  'massas', 'doces', 'temperos', 'outros'
);

create type storage_location as enum (
  'despensa', 'geladeira', 'congelador'
);

create type removal_destination as enum (
  'consumido', 'descartado'
);

-- Tabela profiles (1:1 com auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  warning_days_before_expiry int not null default 5,
  notifications_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tabela products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  image_url text,
  barcode text,
  category product_category not null default 'outros',
  storage_location storage_location not null default 'despensa',
  quantity numeric(10,2) not null default 1 check (quantity >= 0),
  expiration_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_user_expiry_idx on public.products (user_id, expiration_date);
create index products_user_category_idx on public.products (user_id, category);

-- Tabela product_removals
create table public.product_removals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_name text not null,
  category product_category not null,
  quantity_removed numeric(10,2) not null check (quantity_removed > 0),
  destination removal_destination not null,
  was_expired boolean not null,
  removed_at timestamptz not null default now()
);

create index product_removals_user_date_idx on public.product_removals (user_id, removed_at desc);

-- Tabela notification_tokens
create table public.notification_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  expo_push_token text not null unique,
  device_info jsonb,
  created_at timestamptz not null default now()
);

-- RLS: profiles
alter table public.profiles enable row level security;

create policy "Users see own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users delete own profile"
  on public.profiles for delete using (auth.uid() = id);

-- RLS: products
alter table public.products enable row level security;

create policy "Users see own products"
  on public.products for select using (auth.uid() = user_id);

create policy "Users insert own products"
  on public.products for insert with check (auth.uid() = user_id);

create policy "Users update own products"
  on public.products for update using (auth.uid() = user_id);

create policy "Users delete own products"
  on public.products for delete using (auth.uid() = user_id);

-- RLS: product_removals
alter table public.product_removals enable row level security;

create policy "Users see own removals"
  on public.product_removals for select using (auth.uid() = user_id);

create policy "Users insert own removals"
  on public.product_removals for insert with check (auth.uid() = user_id);

create policy "Users update own removals"
  on public.product_removals for update using (auth.uid() = user_id);

create policy "Users delete own removals"
  on public.product_removals for delete using (auth.uid() = user_id);

-- RLS: notification_tokens
alter table public.notification_tokens enable row level security;

create policy "Users see own tokens"
  on public.notification_tokens for select using (auth.uid() = user_id);

create policy "Users insert own tokens"
  on public.notification_tokens for insert with check (auth.uid() = user_id);

create policy "Users update own tokens"
  on public.notification_tokens for update using (auth.uid() = user_id);

create policy "Users delete own tokens"
  on public.notification_tokens for delete using (auth.uid() = user_id);

-- Trigger: updated_at automático
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger products_updated_at
  before update on public.products
  for each row execute function public.handle_updated_at();

-- Trigger: criar profile automaticamente após signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
