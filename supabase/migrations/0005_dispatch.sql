-- ==========================================================================
-- GetränkeTaxi Greifswald – 0005_dispatch
-- Auftrags-Pool: Fahrer sehen offene, unzugewiesene Bestellungen und
-- können sie selbst annehmen (einfache Disposition ohne Admin).
-- ==========================================================================

-- Fahrer sehen offene, noch nicht zugewiesene Bestellungen.
create policy "orders_select_available"
  on public.orders for select to authenticated
  using (driver_id is null and status = 'pending' and public.is_driver());

-- Fahrer nimmt einen offenen Auftrag an (weist ihn sich selbst zu).
create policy "orders_claim_by_driver"
  on public.orders for update to authenticated
  using (driver_id is null and status = 'pending' and public.is_driver())
  with check (driver_id = auth.uid());

-- Fahrer sehen die Positionen offener Aufträge (für Artikel-Anzahl).
create policy "order_items_select_available"
  on public.order_items for select to authenticated
  using (
    public.is_driver() and exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and o.driver_id is null and o.status = 'pending'
    )
  );
