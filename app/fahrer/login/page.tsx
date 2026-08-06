"use client";

import { useState } from "react";

export default function FahrerLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Login fehlgeschlagen");
      if (d.role !== "driver") {
        await fetch("/api/auth/logout", { method: "POST" });
        throw new Error("Dies ist kein Fahrer-Konto.");
      }
      window.location.href = "/fahrer";
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

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
        <a className="muted" href="/login">
          Kunde&nbsp;→
        </a>
      </div>

      <h1 className="title">Fahrer-Login</h1>
      <p className="sub">Melde dich an, um Lieferungen zu übernehmen.</p>

      {err && <div className="alert error">{err}</div>}

      <form className="panel" onSubmit={submit}>
        <div className="field">
          <label>E-Mail</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="fahrer@getraenketaxi.de"
            autoComplete="email"
          />
        </div>
        <div className="field">
          <label>Passwort</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <button className="btn btn-primary" disabled={busy} type="submit">
          {busy ? "Bitte warten …" : "Anmelden"}
        </button>
      </form>

      <p className="center-note">
        Fahrer-Konten werden über die Zentrale angelegt (Rolle „driver").
      </p>
    </main>
  );
}
