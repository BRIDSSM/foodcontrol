-- auth.role() é instável em contextos de trigger/function — substituído por auth.uid() IS NOT NULL
drop policy if exists "Authenticated users can read cache" on public.barcode_cache;
drop policy if exists "Authenticated users can insert cache" on public.barcode_cache;
drop policy if exists "Authenticated users can update cache" on public.barcode_cache;

create policy "Authenticated users can read cache"
  on public.barcode_cache for select
  using (auth.uid() is not null);

create policy "Authenticated users can insert cache"
  on public.barcode_cache for insert
  with check (auth.uid() is not null);

create policy "Authenticated users can update cache"
  on public.barcode_cache for update
  using (auth.uid() is not null);

-- Grants faltantes nas migrations manuais (anon/authenticated precisam de SELECT/INSERT/UPDATE/DELETE)
grant select, insert, update, delete on public.barcode_cache        to anon, authenticated;
grant select, insert, update, delete on public.products             to anon, authenticated;
grant select, insert, update, delete on public.product_removals     to anon, authenticated;
grant select, insert, update, delete on public.profiles             to anon, authenticated;
grant select, insert, update, delete on public.notification_tokens  to anon, authenticated;
