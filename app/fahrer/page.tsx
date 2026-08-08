"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Driver, OrderWithItems, DriverStatus } from "@/types/supabase";

const eur = (n: number) =>
  n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

const STATUS_LABEL: Record<string, string> = {
  pending: "Offen",
  confirmed: "Bestätigt",
  preparing: "Wird gepackt",
  assigned: "Zugeteilt",
  en_route: "Unterwegs",
  delivered: "Geliefert",
  cancelled: "Storniert",
};
// Nächster Schritt, den der Fahrer auslösen darf
const NEXT_STATUS: Record<string, DriverStatusNext | undefined> = {
  assigned: { to: "en_route", label: "Fahrt starten" },
  en_route: { to: "delivered", label: "Als geliefert markieren" },
};
type DriverStatusNext = { to: string; label: string };

export default function FahrerDashboard() {
  const [loading, setLoading] = useState(true);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [deliveries, setDeliveries] = useState<OrderWithItems[]>([]);
  const [available, setAvailable] = useState<OrderWithItems[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsMsg, setGpsMsg] = useState("");
  const [err, setErr] = useState("");
  const [autoGps, setAutoGps] = useState(false);
  const autoRef = useRef<number | null>(null);

  const loadDeliveries = useCallback(async () => {
    const r = await fetch("/api/driver/deliveries");
    if (r.ok) setDeliveries((await r.json()).deliveries ?? []);
  }, []);

  const loadAvailable = useCallback(async () => {
    const r = await fetch("/api/driver/available");
    if (r.ok) setAvailable((await r.json()).available ?? []);
  }, []);

  async function accept(order_id: string) {
    setErr("");
    const r = await fetch("/api/driver/available", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id }),
    });
    if (r.ok) {
      await Promise.all([loadAvailable(), loadDeliveries()]);
    } else {
      setErr((await r.json()).error || "Annehmen fehlgeschlagen");
      loadAvailable();
    }
  }

  useEffect(() => {
    (async () => {
      const u = await fetch("/api/auth/user");
      if (u.status === 401) {
        window.location.href = "/fahrer/login";
        return;
      }
      const ud = await u.json();
      if (ud.role !== "driver") {
        window.location.href = "/login";
        return;
      }
      const s = await fetch("/api/driver/status");
      if (s.ok) setDriver((await s.json()).driver ?? null);
      await Promise.all([loadDeliveries(), loadAvailable()]);
      setLoading(false);
    })().catch(() => setLoading(false));
  }, [loadDeliveries, loadAvailable]);

  // Aufträge alle 15 s aktualisieren
  useEffect(() => {
    const id = window.setInterval(() => {
      loadDeliveries();
      loadAvailable();
    }, 15000);
    return () => window.clearInterval(id);
  }, [loadDeliveries, loadAvailable]);

  async function setStatus(status: DriverStatus) {
    setErr("");
    const r = await fetch("/api/driver/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const d = await r.json();
    if (!r.ok) {
      setErr(d.error || "Status konnte nicht geändert werden");
      return;
    }
    setDriver(d.driver);
  }

  const sendLocation = useCallback(async () => {
    if (!("geolocation" in navigator)) {
      setGpsMsg("Kein GPS verfügbar.");
      return;
    }
    setGpsMsg("Standort wird ermittelt …");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, heading, speed, accuracy } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        const r = await fetch("/api/driver/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lat: latitude,
            lng: longitude,
            heading: heading ?? undefined,
            speed: speed ?? undefined,
            accuracy: accuracy ?? undefined,
          }),
        });
        setGpsMsg(r.ok ? "Standort gesendet ✓" : "Senden fehlgeschlagen");
      },
      () => setGpsMsg("Standort-Zugriff verweigert."),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  // Auto-GPS alle 20 s
  useEffect(() => {
    if (autoGps) {
      sendLocation();
      autoRef.current = window.setInterval(sendLocation, 20000);
    } else if (autoRef.current) {
      window.clearInterval(autoRef.current);
      autoRef.current = null;
    }
    return () => {
      if (autoRef.current) window.clearInterval(autoRef.current);
    };
  }, [autoGps, sendLocation]);

  async function advance(order_id: string, to: string) {
    const r = await fetch("/api/driver/deliveries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id, status: to }),
    });
    if (r.ok) loadDeliveries();
    else setErr((await r.json()).error || "Status-Update fehlgeschlagen");
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/fahrer/login";
  }

  if (loading) return <main className="page"><p className="muted">Lädt …</p></main>;

  const status = driver?.status ?? "offline";
  const pillClass = status === "offline" ? "offline" : status === "online" ? "online" : "busy";
  const pillText = status === "offline" ? "Offline" : status === "online" ? "Online" : "Unterwegs";

  return (
    <main className="page">
      <div className="topbar">
        <div className="row" style={{ gap: 10 }}>
          <span className="mark">GT</span>
          <b>
            Fahrer<span>-App</span>
          </b>
        </div>
        <div className="spacer" />
        <span className={`pill ${pillClass}`}>
          <span className="dot" />
          {pillText}
        </span>
      </div>

      <h1 className="title">Hallo{driver?.full_name ? `, ${driver.full_name}` : ""} 👋</h1>
      <p className="sub">Verwalte deinen Status, GPS und Lieferungen.</p>

      {err && <div className="alert error">{err}</div>}

      <div className="panel">
        <b>Verfügbarkeit</b>
        <div className="seg" style={{ marginTop: 10 }}>
          {(["offline", "online", "on_delivery"] as DriverStatus[]).map((s) => (
            <button
              key={s}
              className={status === s ? "active" : ""}
              onClick={() => setStatus(s)}
            >
              {s === "offline" ? "Offline" : s === "online" ? "Online" : "Unterwegs"}
            </button>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="between">
          <b>GPS-Standort</b>
          <label className="row muted" style={{ gap: 6 }}>
            <input
              type="checkbox"
              checked={autoGps}
              onChange={(e) => setAutoGps(e.target.checked)}
            />
            Auto (20 s)
          </label>
        </div>
        <button
          className="btn btn-ghost"
          style={{ marginTop: 10 }}
          onClick={sendLocation}
        >
          📍 Standort jetzt senden
        </button>
        {coords && (
          <p className="muted" style={{ marginTop: 8 }}>
            Zuletzt: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
          </p>
        )}
        {gpsMsg && <p className="muted">{gpsMsg}</p>}
      </div>

      <div className="panel">
        <div className="between" style={{ marginBottom: 6 }}>
          <b>Verfügbare Aufträge</b>
          <span className="pill busy"><span className="dot" />{available.length}</span>
        </div>
        {available.length === 0 ? (
          <p className="empty">Zurzeit keine offenen Aufträge.</p>
        ) : (
          available.map((o) => (
            <div className="delivery" key={o.id}>
              <div className="between">
                <h4>Bestellung #{o.order_number}</h4>
                <b style={{ color: "var(--gold)" }}>{eur(o.total)}</b>
              </div>
              <div className="muted">{o.address ?? "Adresse folgt"}</div>
              <div className="between" style={{ margin: "8px 0 10px" }}>
                <span className="muted">{o.order_items.length} Artikel · {o.delivery_zone}</span>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => accept(o.id)}>
                Auftrag annehmen
              </button>
            </div>
          ))
        )}
      </div>

      <div className="panel">
        <div className="between" style={{ marginBottom: 6 }}>
          <b>Meine Lieferungen</b>
          <button className="btn btn-ghost btn-sm" onClick={loadDeliveries}>
            Aktualisieren
          </button>
        </div>
        {deliveries.length === 0 ? (
          <p className="empty">Aktuell keine zugewiesenen Lieferungen.</p>
        ) : (
          deliveries.map((o) => {
            const nx = NEXT_STATUS[o.status];
            return (
              <div className="delivery" key={o.id}>
                <div className="between">
                  <h4>Bestellung #{o.order_number}</h4>
                  <span className="pill busy">{STATUS_LABEL[o.status] ?? o.status}</span>
                </div>
                <div className="muted">{o.address ?? "Adresse folgt"}</div>
                <div className="between" style={{ margin: "8px 0" }}>
                  <span className="muted">{o.order_items.length} Artikel</span>
                  <b style={{ color: "var(--gold)" }}>{eur(o.total)}</b>
                </div>
                {nx && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => advance(o.id, nx.to)}
                  >
                    {nx.label}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="between">
        <button className="btn btn-danger btn-sm" onClick={logout}>
          Abmelden
        </button>
      </div>
    </main>
  );
}
