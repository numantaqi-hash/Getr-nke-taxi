"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type * as LeafletNS from "leaflet";

const GREIFSWALD: [number, number] = [54.0865, 13.3923];

const STATUS_LABEL: Record<string, string> = {
  pending: "Bestellung eingegangen – Fahrer wird gesucht",
  confirmed: "Bestätigt",
  preparing: "Wird gepackt",
  assigned: "Fahrer zugeteilt – macht sich bereit",
  en_route: "Fahrer ist unterwegs zu dir 🚕",
};

type Loc = { lat: number; lng: number };
type Order = { id: string; order_number: number; status: string; driver_id: string | null; address: string | null };

function pin(L: typeof LeafletNS, emoji: string, ring: string) {
  return L.divIcon({
    className: "",
    html: `<div style="width:40px;height:40px;display:grid;place-items:center;font-size:22px;
      background:#12141c;border:2px solid ${ring};border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);box-shadow:0 6px 16px rgba(0,0,0,.5)">
      <span style="transform:rotate(45deg)">${emoji}</span></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 38],
  });
}

export default function VerfolgenPage() {
  const mapEl = useRef<HTMLDivElement | null>(null);
  const map = useRef<LeafletNS.Map | null>(null);
  const L = useRef<typeof LeafletNS | null>(null);
  const dMarker = useRef<LeafletNS.Marker | null>(null);
  const cMarker = useRef<LeafletNS.Marker | null>(null);

  const [phase, setPhase] = useState<"loading" | "none" | "active">("loading");
  const [order, setOrder] = useState<Order | null>(null);
  const [driverLoc, setDriverLoc] = useState<Loc | null>(null);
  const [custLoc, setCustLoc] = useState<Loc | null>(null);
  const [updated, setUpdated] = useState<string>("");

  // Karte initialisieren (nur Client)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const leaflet = await import("leaflet");
      if (cancelled || !mapEl.current || map.current) return;
      L.current = leaflet;
      const m = leaflet.map(mapEl.current, { zoomControl: true, attributionControl: true }).setView(GREIFSWALD, 13);
      leaflet
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap-Mitwirkende",
          maxZoom: 19,
        })
        .addTo(m);
      map.current = m;
      setTimeout(() => m.invalidateSize(), 120);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Tracking pollen
  useEffect(() => {
    let stop = false;
    async function poll() {
      const r = await fetch("/api/customer/tracking");
      if (r.status === 401) {
        window.location.href = "/login?next=/verfolgen";
        return;
      }
      const d = await r.json();
      if (!d.order) {
        setPhase("none");
        return;
      }
      setPhase("active");
      setOrder(d.order);
      if (d.driver_location) {
        setDriverLoc({ lat: d.driver_location.lat, lng: d.driver_location.lng });
        setUpdated(new Date(d.driver_location.recorded_at).toLocaleTimeString("de-DE"));
      }
    }
    poll();
    const id = window.setInterval(() => !stop && poll(), 8000);
    return () => {
      stop = true;
      window.clearInterval(id);
    };
  }, []);

  // Eigenen Standort verfolgen
  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    const id = navigator.geolocation.watchPosition(
      (p) => setCustLoc({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  // Marker aktualisieren
  useEffect(() => {
    const leaflet = L.current;
    const m = map.current;
    if (!leaflet || !m) return;
    const pts: [number, number][] = [];
    if (driverLoc) {
      const ll: [number, number] = [driverLoc.lat, driverLoc.lng];
      if (!dMarker.current) dMarker.current = leaflet.marker(ll, { icon: pin(leaflet, "🚕", "#5ad1ff") }).addTo(m);
      else dMarker.current.setLatLng(ll);
      pts.push(ll);
    }
    if (custLoc) {
      const ll: [number, number] = [custLoc.lat, custLoc.lng];
      if (!cMarker.current) cMarker.current = leaflet.marker(ll, { icon: pin(leaflet, "🏠", "#f6c453") }).addTo(m);
      else cMarker.current.setLatLng(ll);
      pts.push(ll);
    }
    if (pts.length === 1) m.setView(pts[0], 15);
    else if (pts.length === 2) m.fitBounds(pts, { padding: [60, 60], maxZoom: 16 });
  }, [driverLoc, custLoc]);

  return (
    <main className="page" style={{ maxWidth: 640 }}>
      <div className="topbar">
        <a className="row" href="/konto" style={{ gap: 10 }}>
          <span className="mark">GT</span>
          <b>
            Getränke<span>Taxi</span>
          </b>
        </a>
        <div className="spacer" />
        <a className="muted" href="/konto">
          Mein Konto&nbsp;→
        </a>
      </div>

      <h1 className="title">Live-Verfolgung</h1>

      {phase === "loading" && <p className="sub">Lädt …</p>}

      {phase === "none" && (
        <div className="panel">
          <p className="empty">
            Keine aktive Lieferung.
            <br />
            <a className="link" href="/">
              Jetzt bestellen →
            </a>
          </p>
        </div>
      )}

      {phase === "active" && order && (
        <>
          <div className="panel" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <div>
              <b>Bestellung #{order.order_number}</b>
              <div className="muted">{STATUS_LABEL[order.status] ?? order.status}</div>
            </div>
            <span className={`pill ${order.status === "en_route" ? "online" : "busy"}`}>
              <span className="dot" />
              {order.status === "en_route" ? "Unterwegs" : order.driver_id ? "Zugeteilt" : "Warten"}
            </span>
          </div>

          <div
            ref={mapEl}
            style={{
              height: "58vh",
              minHeight: 320,
              borderRadius: 18,
              overflow: "hidden",
              border: "1px solid var(--line)",
              background: "#0f1117",
            }}
          />

          <div className="panel" style={{ marginTop: 14 }}>
            <div className="between">
              <span className="row" style={{ gap: 8 }}>
                <span aria-hidden="true">🚕</span> Fahrer
                <span className="muted">{driverLoc ? `· aktualisiert ${updated}` : "· noch kein Signal"}</span>
              </span>
            </div>
            <div className="between" style={{ marginTop: 8 }}>
              <span className="row" style={{ gap: 8 }}>
                <span aria-hidden="true">🏠</span> Dein Standort
                <span className="muted">{custLoc ? "· aktiv" : "· Standort erlauben"}</span>
              </span>
            </div>
          </div>
          <p className="center-note">Position aktualisiert sich automatisch alle paar Sekunden.</p>
        </>
      )}
    </main>
  );
}
