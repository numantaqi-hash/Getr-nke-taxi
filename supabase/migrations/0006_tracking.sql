-- ==========================================================================
-- GetränkeTaxi Greifswald – 0006_tracking
-- Live-Tracking: der Kunde sieht die GPS-Punkte des ihm zugewiesenen Fahrers,
-- solange die Lieferung aktiv ist (assigned / en_route).
-- ==========================================================================

create policy "live_locations_select_customer_by_driver"
  on public.live_locations for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.customer_id = auth.uid()
        and o.driver_id = live_locations.driver_id
        and o.status in ('assigned', 'en_route')
    )
  );
