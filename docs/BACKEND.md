# Backend-Architektur — GetränkeTaxi Greifswald

Next.js 14 (App Router) + **Supabase** (Postgres, Auth, RLS, Realtime).
Der statische Prototyp (`index.html`, `prototype/`) bleibt **unverändert** und
wird von Next.js nicht gebaut. Diese Schicht ergänzt nur die Architektur.

---

## 1. Einrichtung

```bash
npm install                 # Abhängigkeiten (bereits erledigt)
cp .env.example .env.local  # dann Supabase-Werte eintragen
```

`.env.local` (Platzhalter in `.env.example`):

| Variable | Woher |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | dito |
| `SUPABASE_SERVICE_ROLE_KEY` | dito – **nur serverseitig**, nie ins Frontend |

### Datenbank starten

**Lokal (Docker nötig):**
```bash
npm run db:start     # supabase start  → lokale Instanz + Studio :54323
npm run db:reset     # wendet alle Migrations aus supabase/migrations an
```

**Cloud-Projekt:**
```bash
supabase link --project-ref <ref>
npm run db:push      # Migrations in die Cloud spielen
```

Danach in den Supabase **Auth-Settings** ggf. „Confirm email“ deaktivieren
(für den Prototyp), damit Register → Login direkt funktioniert.

### App starten
```bash
npm run dev          # http://localhost:3000  (Backend-Übersicht + API)
npm run typecheck    # TypeScript prüfen
```

---

## 2. Datenmodell

```
auth.users ──1:1──► customers          (Rolle: customer)
auth.users ──1:1──► drivers            (Rolle: driver)
drivers    ──1:n──► vehicles
customers  ──1:n──► orders ──1:n──► order_items
drivers    ──1:n──► orders            (zugewiesene Lieferung)
drivers    ──1:n──► live_locations    (GPS-Historie)
```

Migrations (`supabase/migrations/`):

- `0001_init.sql` — Enums, Tabellen, Indizes, `updated_at`-Trigger, View `driver_current_location`.
- `0002_functions.sql` — `handle_new_user` (Rollen-Routing), `is_driver()/is_customer()`, atomare `place_order()`.
- `0003_rls.sql` — Row Level Security für alle Tabellen.

---

## 3. Auth & Rollen

Zwei Rollen: **customer** und **driver**. Die Rolle wird beim Signup als
Metadatum (`options.data.role`) übergeben. Der Trigger `handle_new_user()`
legt automatisch den passenden Profil-Datensatz an (`customers` **oder**
`drivers`). Rollenprüfung in Routen via `resolveRole()`, in SQL via
`is_driver()` / `is_customer()`.

---

## 4. Row Level Security (Kurzfassung)

| Tabelle | Zugriff |
|---|---|
| `customers` / `drivers` | nur eigener Datensatz (`id = auth.uid()`) |
| `vehicles` | Fahrer nur eigene (`driver_id = auth.uid()`) |
| `orders` | Kunde eigene · zugewiesener Fahrer seine |
| `order_items` | über zugehörige Bestellung abgesichert |
| `live_locations` | Fahrer eigene schreiben/lesen · Kunde liest Punkte seiner Lieferung |

Da alle API-Routen mit dem **eingeloggten** Supabase-Client arbeiten, greift RLS
automatisch — die Datentrennung liegt in der Datenbank, nicht nur im App-Code.

---

## 5. API-Routen

| Methode | Pfad | Zweck |
|---|---|---|
| `GET` | `/api/health` | Status + Env-Check |
| `POST` | `/api/auth/register` | Registrieren (`role`: customer/driver) |
| `POST` | `/api/auth/login` | Login |
| `POST` | `/api/auth/logout` | Logout |
| `GET` | `/api/auth/user` | aktueller User + Rolle |
| `GET` `PATCH` | `/api/customer/profile` | Profil lesen / bearbeiten |
| `GET` `POST` | `/api/customer/orders` | Bestellhistorie / Bestellen (`place_order`) |
| `PATCH` | `/api/driver/status` | Online / Offline / On Delivery |
| `GET` `POST` | `/api/driver/location` | GPS lesen / aktualisieren |
| `GET` | `/api/driver/deliveries` | zugewiesene Lieferungen |

---

## 6. Ordnerstruktur

```
app/
  layout.tsx  page.tsx  globals.css   # Dev-Übersicht (kein Shop-Redesign)
  api/
    auth/{register,login,logout,user}/route.ts
    customer/{profile,orders}/route.ts
    driver/{status,location,deliveries}/route.ts
    health/route.ts
lib/
  supabase/{client,server,middleware,admin}.ts
  auth.ts  constants.ts  env.ts  api.ts
types/
  database.ts    # DB-Typen (via `npm run db:types` regenerierbar)
  supabase.ts    # Helfer: Tables<>, Enums<>, Aliase
supabase/
  config.toml
  migrations/{0001_init,0002_functions,0003_rls}.sql
middleware.ts    # Session-Refresh
```

---

## 7. Vorbereitet für spätere Features

- **Live GPS Tracking** — Tabelle `live_locations` + View `driver_current_location`
  + `order_id`-Verknüpfung. Realtime ist in `config.toml` aktiviert; Frontend kann
  auf `live_locations` subscriben. Karten-Token-Platzhalter: `NEXT_PUBLIC_MAPBOX_TOKEN`.
- **Admin Dashboard** — `lib/supabase/admin.ts` (Service-Role, umgeht RLS) für
  Disposition (Fahrer zuweisen: `orders.driver_id`, `assigned_at`, Status).
- **Notifications** — Enums/Status vorhanden; Web-Push-Platzhalter (`VAPID_*`).
  Empfohlen: Tabelle `notifications` + Supabase Realtime/Edge Functions.
- **Payment** — `orders.payment_status` / `payment_method` (inkl. `stripe`),
  Env-Platzhalter `STRIPE_*`. Webhook-Route unter `app/api/webhooks/` ergänzen.

> Alles ist **Demo** — keine echte Zahlung. Diesen Hinweis beibehalten.
