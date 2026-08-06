import { hasSupabaseEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

const ROUTES: { method: string; path: string; desc: string }[] = [
  { method: "GET", path: "/api/health", desc: "Status & Env-Check" },
  { method: "POST", path: "/api/auth/register", desc: "Registrieren (Kunde/Fahrer)" },
  { method: "POST", path: "/api/auth/login", desc: "Login" },
  { method: "POST", path: "/api/auth/logout", desc: "Logout" },
  { method: "GET", path: "/api/auth/user", desc: "Aktueller User + Rolle" },
  { method: "GET·PATCH", path: "/api/customer/profile", desc: "Profil lesen/ändern" },
  { method: "GET·POST", path: "/api/customer/orders", desc: "Historie / Bestellen" },
  { method: "PATCH", path: "/api/driver/status", desc: "Online/Offline" },
  { method: "GET·POST", path: "/api/driver/location", desc: "GPS aktualisieren" },
  { method: "GET", path: "/api/driver/deliveries", desc: "Zugewiesene Lieferungen" },
];

export default function Page() {
  const configured = hasSupabaseEnv();
  return (
    <main
      style={{
        maxWidth: 760,
        margin: "0 auto",
        padding: "48px 20px 80px",
      }}
    >
      <p style={{ color: "var(--gold)", fontWeight: 700, letterSpacing: 0.4 }}>
        GETRÄNKETAXI GREIFSWALD · BACKEND
      </p>
      <h1 style={{ fontSize: 34, margin: "6px 0 10px" }}>
        Backend-Architektur bereit
      </h1>
      <p style={{ color: "var(--ink-dim)", maxWidth: 560 }}>
        Next.js 14 (App Router) + Supabase. Das bestehende Shop-Design bleibt
        unverändert – dies ist nur die Entwickler-Übersicht der Backend-Schicht.
      </p>

      <div
        style={{
          display: "inline-block",
          marginTop: 12,
          padding: "8px 14px",
          borderRadius: 999,
          border: "1px solid var(--line)",
          background: configured ? "rgba(80,220,120,.12)" : "rgba(255,176,32,.12)",
          color: configured ? "#7fe0a0" : "#ffb020",
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        {configured
          ? "● Supabase konfiguriert"
          : "● Supabase noch nicht konfiguriert – .env.local anlegen (siehe .env.example)"}
      </div>

      <h2 style={{ fontSize: 20, marginTop: 34 }}>API-Routen</h2>
      <div
        style={{
          border: "1px solid var(--line)",
          borderRadius: 14,
          overflow: "hidden",
          marginTop: 12,
        }}
      >
        {ROUTES.map((r, i) => (
          <div
            key={r.path}
            style={{
              display: "flex",
              gap: 14,
              alignItems: "center",
              padding: "12px 16px",
              background: i % 2 ? "transparent" : "rgba(255,255,255,.02)",
              borderTop: i ? "1px solid var(--line)" : "none",
            }}
          >
            <code
              style={{
                color: "var(--gold)",
                fontSize: 12,
                minWidth: 78,
                fontWeight: 700,
              }}
            >
              {r.method}
            </code>
            <code style={{ fontSize: 13, minWidth: 210 }}>{r.path}</code>
            <span style={{ color: "var(--ink-dim)", fontSize: 13 }}>
              {r.desc}
            </span>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 20, marginTop: 34 }}>Screens</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
        {[
          { href: "/shop", label: "🛒 Shop (Bestellen)" },
          { href: "/login", label: "👤 Kunden-Login" },
          { href: "/konto", label: "📋 Mein Konto" },
          { href: "/fahrer/login", label: "🚕 Fahrer-Login" },
          { href: "/fahrer", label: "🧭 Fahrer-Dashboard" },
        ].map((l) => (
          <a
            key={l.href}
            href={l.href}
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              border: "1px solid var(--line)",
              background: "rgba(255,255,255,.03)",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            {l.label}
          </a>
        ))}
      </div>

      <p style={{ color: "var(--ink-dim)", fontSize: 13, marginTop: 28 }}>
        Einrichtung & Datenbank-Schema: siehe <code>docs/BACKEND.md</code>.
      </p>
    </main>
  );
}
