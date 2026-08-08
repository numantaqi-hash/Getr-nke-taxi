"use client";

import { useEffect, useState } from "react";
import type { Customer, OrderWithItems, DeliveryZone } from "@/types/supabase";

const eur = (n: number) =>
  n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

const STATUS_LABEL: Record<string, string> = {
  pending: "Offen",
  confirmed: "Bestätigt",
  preparing: "Wird gepackt",
  assigned: "Fahrer zugeteilt",
  en_route: "Unterwegs",
  delivered: "Geliefert",
  cancelled: "Storniert",
};

export default function KontoPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Partial<Customer> | null>(null);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const u = await fetch("/api/auth/user");
      if (u.status === 401) {
        window.location.href = "/login?next=/konto";
        return;
      }
      const ud = await u.json();
      if (ud.role === "driver") {
        window.location.href = "/fahrer";
        return;
      }
      const [p, o] = await Promise.all([
        fetch("/api/customer/profile"),
        fetch("/api/customer/orders"),
      ]);
      const pd = await p.json();
      const od = await o.json();
      setProfile(pd.profile ?? null);
      setOrders(od.orders ?? []);
      setLoading(false);
    })().catch(() => setLoading(false));
  }, []);

  async function save() {
    if (!profile) return;
    setErr("");
    setMsg("");
    setSaving(true);
    try {
      const r = await fetch("/api/customer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: profile.full_name,
          phone: profile.phone,
          default_address: profile.default_address,
          default_zone: profile.default_zone,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Speichern fehlgeschlagen");
      setProfile(d.profile);
      setMsg("Profil gespeichert ✓");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  const set = (k: keyof Customer, v: string) =>
    setProfile((p) => ({ ...(p ?? {}), [k]: v }));

  if (loading) return <main className="page"><p className="muted">Lädt …</p></main>;

  return (
    <main className="page">
      <div className="topbar">
        <a className="row" href="/shop" style={{ gap: 10 }}>
          <span className="mark">GT</span>
          <b>
            Getränke<span>Taxi</span>
          </b>
        </a>
        <div className="spacer" />
        <button className="btn btn-danger btn-sm" onClick={logout}>
          Abmelden
        </button>
      </div>

      <h1 className="title">Mein Konto</h1>
      <p className="sub">{profile?.email}</p>

      {err && <div className="alert error">{err}</div>}
      {msg && <div className="alert ok">{msg}</div>}

      <div className="panel">
        <div className="between" style={{ marginBottom: 10 }}>
          <b>Profil</b>
        </div>
        <div className="field">
          <label>Name</label>
          <input
            value={profile?.full_name ?? ""}
            onChange={(e) => set("full_name", e.target.value)}
          />
        </div>
        <div className="field">
          <label>Telefon</label>
          <input
            value={profile?.phone ?? ""}
            onChange={(e) => set("phone", e.target.value)}
            inputMode="tel"
          />
        </div>
        <div className="field">
          <label>Standard-Lieferadresse</label>
          <input
            value={profile?.default_address ?? ""}
            onChange={(e) => set("default_address", e.target.value)}
            placeholder="Straße, Hausnr., Greifswald"
          />
        </div>
        <div className="field">
          <label>Standard-Lieferzone</label>
          <select
            value={profile?.default_zone ?? "city"}
            onChange={(e) => set("default_zone", e.target.value as DeliveryZone)}
          >
            <option value="city">Stadtgebiet (3,00 €)</option>
            <option value="5km">Bis 5 km (7,00 €)</option>
            <option value="far">Weiter draußen (individuell)</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? "Speichert …" : "Speichern"}
        </button>
      </div>

      <div className="panel">
        <b>Bestellverlauf</b>
        {orders.length === 0 ? (
          <p className="empty">
            Noch keine Bestellungen.
            <br />
            <a className="link" href="/shop">
              Jetzt bestellen →
            </a>
          </p>
        ) : (
          <div style={{ marginTop: 12 }}>
            {orders.map((o) => (
              <div className="delivery" key={o.id}>
                <div className="between">
                  <h4>Bestellung #{o.order_number}</h4>
                  <span className="pill busy">
                    {STATUS_LABEL[o.status] ?? o.status}
                  </span>
                </div>
                <div className="muted">
                  {new Date(o.placed_at).toLocaleString("de-DE")}
                </div>
                <div style={{ margin: "8px 0", fontSize: 13 }}>
                  {o.order_items.map((it) => (
                    <div className="between" key={it.id}>
                      <span>
                        {it.quantity}× {it.name}
                      </span>
                      <span className="muted">{eur(it.line_total)}</span>
                    </div>
                  ))}
                </div>
                <div className="between" style={{ borderTop: "1px solid var(--line)", paddingTop: 8 }}>
                  <span className="muted">
                    inkl. Lieferung {eur(o.delivery_fee)}
                  </span>
                  <b style={{ color: "var(--gold)" }}>{eur(o.total)}</b>
                </div>
                {o.status !== "delivered" && o.status !== "cancelled" && (
                  <a className="btn btn-primary btn-sm" href="/verfolgen" style={{ marginTop: 10 }}>
                    📍 Live verfolgen
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="center-note">
        <a className="link" href="/shop">
          ← Zurück zum Shop
        </a>
      </p>
    </main>
  );
}
