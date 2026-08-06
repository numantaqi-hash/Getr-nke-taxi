"use client";

import { useEffect, useState } from "react";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [next, setNext] = useState("/konto");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("next");
    if (p) setNext(p);
  }, []);

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
        window.location.href = next;
      } else {
        const r = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            role: "customer",
            full_name: fullName,
            phone,
          }),
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Registrierung fehlgeschlagen");
        if (d.needsEmailConfirmation) {
          setInfo("Fast fertig! Bestätige deine E-Mail und melde dich dann an.");
          setMode("login");
        } else {
          window.location.href = next;
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
        <a className="row" href="/shop" style={{ gap: 10 }}>
          <span className="mark">GT</span>
          <b>
            Getränke<span>Taxi</span>
          </b>
        </a>
        <div className="spacer" />
        <a className="muted" href="/fahrer/login">
          Fahrer&nbsp;→
        </a>
      </div>

      <h1 className="title">Willkommen zurück</h1>
      <p className="sub">Melde dich an oder erstelle ein Konto, um zu bestellen.</p>

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
                placeholder="Max Mustermann"
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
          </>
        )}
        <div className="field">
          <label>E-Mail</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="du@beispiel.de"
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
          {busy ? "Bitte warten …" : mode === "login" ? "Anmelden" : "Konto erstellen"}
        </button>
      </form>

      <p className="center-note">
        Bist du Fahrer?{" "}
        <a className="link" href="/fahrer/login">
          Zum Fahrer-Login
        </a>
      </p>
    </main>
  );
}
