-- ==========================================================================
-- GetränkeTaxi Greifswald – 0003_rls
-- Row Level Security: jede*r sieht/ändert nur eigene Daten.
-- ==========================================================================

alter table public.customers      enable row level security;
alter table public.drivers        enable row level security;
alter table public.vehicles       enable row level security;
alter table public.orders         enable row level security;
alter table public.order_items    enable row level security;
alter table public.live_locations enable row level security;

-- --------------------------------------------------------------------------
-- customers – nur eigenes Profil
-- --------------------------------------------------------------------------
create policy "customers_select_own"
  on public.customers for select to authenticated
  using (id = auth.uid());

create policy "customers_insert_own"
  on public.customers for insert to authenticated
  with check (id = auth.uid());

create policy "customers_update_own"
  on public.customers for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- --------------------------------------------------------------------------
-- drivers – nur eigenes Profil
-- --------------------------------------------------------------------------
create policy "drivers_select_own"
  on public.drivers for select to authenticated
  using (id = auth.uid());

create policy "drivers_insert_own"
  on public.drivers for insert to authenticated
  with check (id = auth.uid());

create policy "drivers_update_own"
  on public.drivers for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- --------------------------------------------------------------------------
-- vehicles – Fahrer verwaltet nur eigene Fahrzeuge
-- --------------------------------------------------------------------------
create policy "vehicles_select_own"
  on public.vehicles for select to authenticated
  using (driver_id = auth.uid());

create policy "vehicles_insert_own"
  on public.vehicles for insert to authenticated
  with check (driver_id = auth.uid());

create policy "vehicles_update_own"
  on public.vehicles for update to authenticated
  using (driver_id = auth.uid())
  with check (driver_id = auth.uid());

create policy "vehicles_delete_own"
  on public.vehicles for delete to authenticated
  using (driver_id = auth.uid());

-- --------------------------------------------------------------------------
-- orders – Kunde sieht eigene, zugewiesener Fahrer sieht seine
-- --------------------------------------------------------------------------
create policy "orders_select_customer"
  on public.orders for select to authenticated
  using (customer_id = auth.uid());

create policy "orders_select_driver"
  on public.orders for select to authenticated
  using (driver_id = auth.uid());

-- Kunde legt eigene Bestellung an (i. d. R. über place_order()).
create policy "orders_insert_customer"
  on public.orders for insert to authenticated
  with check (customer_id = auth.uid());

-- Kunde darf eigene Bestellung ändern, solange sie noch offen ist.
create policy "orders_update_customer"
  on public.orders for update to authenticated
  using (customer_id = auth.uid() and status = 'pending')
  with check (customer_id = auth.uid());

-- Zugewiesener Fahrer darf Status seiner Lieferung fortschreiben.
create policy "orders_update_driver"
  on public.orders for update to authenticated
  using (driver_id = auth.uid())
  with check (driver_id = auth.uid());

-- --------------------------------------------------------------------------
-- order_items – über die zugehörige Bestellung abgesichert
-- --------------------------------------------------------------------------
create policy "order_items_select_related"
  on public.order_items for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.customer_id = auth.uid() or o.driver_id = auth.uid())
    )
  );

create policy "order_items_insert_own_order"
  on public.order_items for insert to authenticated
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and o.customer_id = auth.uid()
    )
  );

-- --------------------------------------------------------------------------
-- live_locations – Fahrer schreibt/liest eigene Punkte,
-- Kunde liest Punkte der zu SEINER Bestellung gehörenden Lieferung.
-- --------------------------------------------------------------------------
create policy "live_locations_insert_own"
  on public.live_locations for insert to authenticated
  with check (driver_id = auth.uid());

create policy "live_locations_select_driver"
  on public.live_locations for select to authenticated
  using (driver_id = auth.uid());

create policy "live_locations_select_customer"
  on public.live_locations for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = live_locations.order_id
        and o.customer_id = auth.uid()
    )
  );
