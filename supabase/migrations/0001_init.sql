-- ==========================================================================
-- GetränkeTaxi Greifswald – 0001_init
-- Enums, Tabellen, Indizes, updated_at-Trigger, Live-Location-View
-- ==========================================================================

create extension if not exists pgcrypto with schema extensions;

-- --------------------------------------------------------------------------
-- Enums
-- --------------------------------------------------------------------------
create type public.user_role      as enum ('customer', 'driver');
create type public.driver_status  as enum ('offline', 'online', 'on_delivery');
create type public.delivery_zone  as enum ('city', '5km', 'far');
create type public.order_status   as enum (
  'pending', 'confirmed', 'preparing', 'assigned', 'en_route', 'delivered', 'cancelled'
);
create type public.payment_status as enum ('unpaid', 'paid', 'refunded');
create type public.payment_method as enum ('cash', 'card', 'paypal', 'stripe');

-- --------------------------------------------------------------------------
-- Generischer updated_at-Trigger
-- --------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- --------------------------------------------------------------------------
-- customers  (1:1 zu auth.users)
-- --------------------------------------------------------------------------
create table public.customers (
  id              uuid primary key references auth.users (id) on delete cascade,
  email           text,
  full_name       text,
  phone           text,
  default_address text,
  default_zone    public.delivery_zone not null default 'city',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
comment on table public.customers is 'Kundenprofile, 1:1 an auth.users gekoppelt.';

create trigger trg_customers_updated
  before update on public.customers
  for each row execute function public.set_updated_at();

-- --------------------------------------------------------------------------
-- drivers  (1:1 zu auth.users)
-- --------------------------------------------------------------------------
create table public.drivers (
  id                 uuid primary key references auth.users (id) on delete cascade,
  email              text,
  full_name          text,
  phone              text,
  status             public.driver_status not null default 'offline',
  is_available       boolean not null default false,
  current_vehicle_id uuid,
  rating             numeric(3,2),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
comment on table public.drivers is 'Fahrerprofile, 1:1 an auth.users gekoppelt.';

create trigger trg_drivers_updated
  before update on public.drivers
  for each row execute function public.set_updated_at();

-- --------------------------------------------------------------------------
-- vehicles
-- --------------------------------------------------------------------------
create table public.vehicles (
  id         uuid primary key default gen_random_uuid(),
  driver_id  uuid references public.drivers (id) on delete set null,
  label      text not null,
  plate      text,
  type       text,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.vehicles is 'Fahrzeuge (z. B. VW T6). Optional einem Fahrer zugeordnet.';

create index idx_vehicles_driver on public.vehicles (driver_id);

create trigger trg_vehicles_updated
  before update on public.vehicles
  for each row execute function public.set_updated_at();

-- Nachträgliche FK: drivers.current_vehicle_id -> vehicles.id
alter table public.drivers
  add constraint drivers_current_vehicle_fk
  foreign key (current_vehicle_id) references public.vehicles (id) on delete set null;

-- --------------------------------------------------------------------------
-- orders
-- --------------------------------------------------------------------------
create table public.orders (
  id             uuid primary key default gen_random_uuid(),
  order_number   bigint generated always as identity,
  customer_id    uuid references public.customers (id) on delete set null,
  driver_id      uuid references public.drivers (id) on delete set null,
  status         public.order_status  not null default 'pending',
  delivery_zone  public.delivery_zone not null default 'city',
  delivery_fee   numeric(10,2) not null default 3.00,
  subtotal       numeric(10,2) not null default 0,
  total          numeric(10,2) not null default 0,
  address        text,
  notes          text,
  payment_status public.payment_status not null default 'unpaid',
  payment_method public.payment_method,
  placed_at      timestamptz not null default now(),
  assigned_at    timestamptz,
  delivered_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
comment on table public.orders is 'Bestellungen. Totals werden serverseitig via place_order() gesetzt.';

create index idx_orders_customer on public.orders (customer_id);
create index idx_orders_driver   on public.orders (driver_id);
create index idx_orders_status   on public.orders (status);

create trigger trg_orders_updated
  before update on public.orders
  for each row execute function public.set_updated_at();

-- --------------------------------------------------------------------------
-- order_items
-- --------------------------------------------------------------------------
create table public.order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders (id) on delete cascade,
  product_id text,                        -- entspricht der id aus data/products.json
  name       text not null,
  unit_price numeric(10,2) not null,
  quantity   integer not null check (quantity > 0),
  line_total numeric(10,2) generated always as (unit_price * quantity) stored,
  created_at timestamptz not null default now()
);
comment on table public.order_items is 'Positionen einer Bestellung (Preis-Snapshot zum Bestellzeitpunkt).';

create index idx_order_items_order on public.order_items (order_id);

-- --------------------------------------------------------------------------
-- live_locations  (GPS-Historie je Fahrer – Basis für Live-Tracking)
-- --------------------------------------------------------------------------
create table public.live_locations (
  id          uuid primary key default gen_random_uuid(),
  driver_id   uuid not null references public.drivers (id) on delete cascade,
  order_id    uuid references public.orders (id) on delete set null,
  lat         double precision not null,
  lng         double precision not null,
  heading     double precision,
  speed       double precision,
  accuracy    double precision,
  recorded_at timestamptz not null default now()
);
comment on table public.live_locations is 'GPS-Punkte der Fahrer (Historie). Neuester Punkt = aktuelle Position.';

create index idx_live_locations_driver on public.live_locations (driver_id, recorded_at desc);
create index idx_live_locations_order  on public.live_locations (order_id, recorded_at desc);

-- Aktuelle Position je Fahrer (für Live-Tracking / Admin)
create or replace view public.driver_current_location as
  select distinct on (driver_id)
    driver_id, order_id, lat, lng, heading, speed, accuracy, recorded_at
  from public.live_locations
  order by driver_id, recorded_at desc;
