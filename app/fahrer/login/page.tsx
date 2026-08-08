"use client";

import { useState } from "react";

export default function FahrerLoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [driverCode, setDriverCode] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setInfo("");
    setBusy(true);
    try {
      if (mode === "login") {
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
      } else {
        const r = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            role: "driver",
            full_name: fullName,
            phone,
            driver_code: driverCode,
          }),
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Registrierung fehlgeschlagen");
        if (d.needsEmailConfirmation) {
          setInfo("Fast fertig! Bestätige deine E-Mail und melde dich dann an.");
          setMode("login");
        } else {
          window.location.href = "/fahrer";
        }
      }
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

      <h1 className="title">Fahrer-Zugang</h1>
      <p className="sub">Melde dich an oder registriere dich als Fahrer.</p>

      <div className="tabs">
        <button
          className={mode === "login" ? "active" : ""}
          onClick={() => setMode("login")}
          type="button"
        >
          Anmelden
        </button>
        <button
          className={mode === "register" ? "active" : ""}
          onClick={() => setMode("register")}
          type="button"
        >
          Registrieren
        </button>
      </div>

      {err && <div className="alert error">{err}</div>}
      {info && <div className="alert info">{info}</div>}

      <form className="panel" onSubmit={submit}>
        {mode === "register" && (
          <>
            <div className="field">
              <label>Name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Vor- und Nachname"
              />
            </div>
            <div className="field">
              <label>Telefon</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0170 …"
                inputMode="tel"
              />
            </div>
            <div className="field">
              <label>Fahrer-Code</label>
              <input
                value={driverCode}
                onChange={(e) => setDriverCode(e.target.value)}
                placeholder="Code von der Zentrale"
                autoComplete="off"
              />
            </div>
          </>
        )}
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
            placeholder="mind. 6 Zeichen"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        </div>
        <button className="btn btn-primary" disabled={busy} type="submit">
          {busy ? "Bitte warten …" : mode === "login" ? "Anmelden" : "Als Fahrer registrieren"}
        </button>
      </form>

      <p className="center-note">
        Kunde?{" "}
        <a className="link" href="/login">
          Zum Kunden-Login
        </a>
      </p>
    </main>
  );
}
