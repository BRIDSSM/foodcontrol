-- Cache global de barcodes (Cosmos API) — compartilhado entre todos os usuários
create table public.barcode_cache (
  gtin text primary key,
  name text not null,
  thumbnail_url text,
  category product_category not null default 'outros',
  raw_response jsonb,
  cached_at timestamptz not null default now()
);

-- RLS: qualquer usuário autenticado lê; qualquer usuário autenticado insere/atualiza
-- (não há dado sensível — são dados públicos de produtos)
alter table public.barcode_cache enable row level security;

create policy "Authenticated users can read cache"
  on public.barcode_cache for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert cache"
  on public.barcode_cache for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update cache"
  on public.barcode_cache for update
  using (auth.role() = 'authenticated');
