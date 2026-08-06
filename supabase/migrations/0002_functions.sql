-- ==========================================================================
-- GetränkeTaxi Greifswald – 0002_functions
-- Auth-Trigger (Rollen-Routing), Rollen-Helper, atomare Bestellung
-- ==========================================================================

-- --------------------------------------------------------------------------
-- Neuen auth.users-Eintrag automatisch in customers ODER drivers spiegeln.
-- Rolle kommt aus dem Signup-Metadaten-Feld "role" (default: customer).
-- --------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text := coalesce(new.raw_user_meta_data ->> 'role', 'customer');
begin
  if v_role = 'driver' then
    insert into public.drivers (id, email, full_name, phone)
    values (
      new.id,
      new.email,
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'phone'
    );
  else
    insert into public.customers (id, email, full_name, phone)
    values (
      new.id,
      new.email,
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'phone'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- --------------------------------------------------------------------------
-- Rollen-Helper (in RLS-Policies verwendet)
-- --------------------------------------------------------------------------
create or replace function public.is_driver()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.drivers where id = auth.uid());
$$;

create or replace function public.is_customer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.customers where id = auth.uid());
$$;

grant execute on function public.is_driver()   to authenticated;
grant execute on function public.is_customer() to authenticated;

-- --------------------------------------------------------------------------
-- Atomare Bestellung: Totals + Mindestbestellwert serverseitig.
-- SECURITY INVOKER -> RLS des aufrufenden Kunden greift weiterhin.
-- p_items: jsonb-Array [{ product_id, name, unit_price, quantity }, ...]
-- --------------------------------------------------------------------------
create or replace function public.place_order(
  p_items          jsonb,
  p_delivery_zone  public.delivery_zone   default 'city',
  p_address        text                   default null,
  p_notes          text                   default null,
  p_payment_method public.payment_method  default null
)
returns public.orders
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_customer uuid := auth.uid();
  v_subtotal numeric(10,2) := 0;
  v_fee      numeric(10,2);
  v_order    public.orders;
  v_item     jsonb;
begin
  if v_customer is null then
    raise exception 'Nicht angemeldet';
  end if;
  if not exists (select 1 from public.customers where id = v_customer) then
    raise exception 'Nur Kunden können Bestellungen aufgeben';
  end if;
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Warenkorb ist leer';
  end if;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_subtotal := v_subtotal
      + ((v_item ->> 'unit_price')::numeric * (v_item ->> 'quantity')::int);
  end loop;

  if v_subtotal < 9 then
    raise exception 'Mindestbestellwert 9,00 € nicht erreicht (aktuell %)', v_subtotal;
  end if;

  v_fee := case p_delivery_zone
             when 'city' then 3.00
             when '5km'  then 7.00
             else 0
           end;

  insert into public.orders (
    customer_id, delivery_zone, delivery_fee, subtotal, total,
    address, notes, payment_method, status
  )
  values (
    v_customer, p_delivery_zone, v_fee, v_subtotal, v_subtotal + v_fee,
    p_address, p_notes, p_payment_method, 'pending'
  )
  returning * into v_order;

  insert into public.order_items (order_id, product_id, name, unit_price, quantity)
  select
    v_order.id,
    i ->> 'product_id',
    i ->> 'name',
    (i ->> 'unit_price')::numeric,
    (i ->> 'quantity')::int
  from jsonb_array_elements(p_items) as i;

  return v_order;
end;
$$;

grant execute on function public.place_order(jsonb, public.delivery_zone, text, text, public.payment_method) to authenticated;
