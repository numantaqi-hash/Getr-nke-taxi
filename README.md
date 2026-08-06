# GetränkeTaxi Greifswald

Nacht-Getränkelieferung für Greifswald (Inh. Mike Gloe) — **Next.js 14 (App Router) + Supabase**.

- **Storefront** (`/`) — mobiler Shop mit 88 Artikeln, animierten Getränke-Icons, Warenkorb & echter Bestellung.
- **Kunde** — Registrieren, Login, Profil, Bestellhistorie (`/login`, `/konto`).
- **Fahrer** — Login, Online/Offline, GPS senden, Lieferungen (`/fahrer/login`, `/fahrer`).
- **Backend** — Supabase (Postgres, Auth, RLS, Realtime). Alle Daten echt, kein Mock.

> Prototyp-Hinweis: keine echte Zahlung. Checkout legt eine echte Bestellung an.

---

## Lokal starten

```bash
npm install
cp .env.example .env.local   # Supabase-Werte eintragen (siehe unten)
npm run dev                  # http://localhost:3000
```

Wichtige Seiten: `/` (Shop) · `/login` · `/konto` · `/fahrer` · `/status` (Dev-Übersicht).

---

## Umgebungsvariablen

| Variable | Pflicht | Quelle |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | dito |
| `SUPABASE_SERVICE_ROLE_KEY` | – | dito (nur serverseitig, für spätere Admin-Funktionen) |
| `NEXT_PUBLIC_SITE_URL` | – | z. B. die Live-Domain |

`.env.local` wird **nicht** committet (siehe `.gitignore`).

---

## Datenbank (Supabase)

Schema liegt in `supabase/migrations/` (Tabellen, RLS, `place_order()`, Auth-Trigger).

```bash
supabase link --project-ref <dein-ref>
npm run db:push        # Migrations in dein Projekt spielen
npm run db:types       # optional: types/database.ts neu generieren
```

**Auth-Einstellung für den Prototyp:** In *Authentication → Providers → Email*
„Confirm email“ deaktivieren, damit Registrieren → Login direkt funktioniert.

---

## Online-Deployment (Vercel)

1. Code in ein Git-Repo pushen (GitHub/GitLab).
2. Auf [vercel.com](https://vercel.com) „New Project" → Repo importieren (Framework: **Next.js**, autoerkennt).
3. **Environment Variables** setzen: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   (optional `SUPABASE_SERVICE_ROLE_KEY`). → **Deploy**.
4. In **Supabase → Authentication → URL Configuration**:
   - *Site URL* = deine Vercel-Domain (z. B. `https://deine-app.vercel.app`)
   - *Redirect URLs* = dieselbe Domain hinzufügen.

Danach ist der Shop live: Storefront, Login, Konto, Fahrer-App und `/api/*` laufen alle auf derselben Domain.

> Alternativ via CLI: `npm i -g vercel && vercel` (folgt dem Assistenten).

---

## Struktur

```
app/
  status/page.tsx          Dev-Übersicht (/status)
  login · konto            Kunden-Screens
  fahrer · fahrer/login    Fahrer-Screens
  shop/route.ts            liefert den Storefront (index.html) auf "/"
  api/…                    Auth, Kunde, Fahrer, Health
lib/supabase/…             Browser-, Server-, Middleware-, Admin-Client
types/                     Datenbank-Typen + Helfer
supabase/migrations/…      Schema, RLS, Funktionen
index.html                 Storefront (Design-Quelle, wird auf "/" serviert)
docs/BACKEND.md            Architektur im Detail
```
