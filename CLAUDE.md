# GetränkeTaxi Greifswald — Projekt-Handoff für Claude Code

Dies ist ein **Konzept-Prototyp** für den digitalen Bestellablauf des *GetränkeTaxi Greifswald*
(Nacht-Getränkelieferung, Inh. Mike Gloe). Ziel des nächsten Schritts: den funktionsfähigen
HTML-Prototyp in eine **Next.js 14 (App Router) + TypeScript**-App überführen.

> Sprache im UI: **Deutsch**. Code-Kommentare & Commits: frei (DE/EN).

---

## 1. Was schon existiert

```
getraenketaxi-greifswald/
├── CLAUDE.md                 ← diese Datei (zuerst lesen)
├── prototype/
│   └── index.html            ← voll funktionsfähiger, self-contained Prototyp (Referenz)
├── data/
│   ├── products.json         ← Sortiment, Kategorien, Lieferzonen, Meta
│   └── design-tokens.json    ← Farben, Radien, Fonts, Layout
└── docs/
    ├── STRUCTURE.md          ← Sektionsaufbau der Seite
    └── NEXTJS-PLAN.md        ← empfohlene Ordnerstruktur + Komponentenschnitt
```

Der Prototyp in `prototype/index.html` ist die **Source of Truth** für Aussehen und Verhalten.
Er läuft ohne Build – einfach im Browser öffnen. Alle Styles/JS sind inline.

---

## 2. Funktionsumfang (im Prototyp bereits umgesetzt)

- **Demo-Leiste** oben mit Ansicht-Umschalter (01 Kunden-Shop / 02 iPad-Dispo / 03 Fahrer-App).
  Aktuell ist nur **Kunden-Shop** gebaut; 02/03 sind Platzhalter (Toast „Ansicht folgt“).
- **Sticky Header**: Logo, Nav (Sortiment / Liefergebiet / So geht's), Öffnungszeiten, Warenkorb-Button mit Counter.
- **Hero**: Headline „Durst? Wir sind schon unterwegs.“, CTAs, 3 Stats (Lieferzeit, Stadtpreis, Mindestbestellwert),
  **Live-Tracking-Karte** mit animierter Route (SVG + CSS `offset-path`, GT-Auto fährt Store → Haus).
- **Service-Strip**: 4 Zellen (Stadtgebiet 3€ / bis 5km 7€ / weiter individuell / „Jetzt geöffnet“).
- **Sortiment**: Suchfeld (live), Kategorie-Filter-Chips, Produkt-Grid mit Karten.
  Karten: Thumbnail-Initialen, Alters-Tags (16+/18+), „Bestseller/Deal“-Tags, Preis, +/Stepper.
- **Warenkorb**: Add/Remove, Stepper, seitlicher Drawer, Zwischensumme + Lieferung 3€ + Gesamt,
  Mindestbestellwert-Hinweis (9€) blockiert Checkout, „Sicher bestellen“ (Demo-Toast).
- **Sticky Cart-Bar** unten (mobil), Toasts, Escape schließt Drawer, `prefers-reduced-motion` respektiert.

Alles ist **Demo** – keine echte Bestellung/Zahlung. Diesen Hinweis beibehalten.

---

## 3. Auftrag für den Next.js-Rebuild

1. Prototyp 1:1 im Look nachbauen, aber sauber komponentisiert (siehe `docs/NEXTJS-PLAN.md`).
2. Daten aus `data/products.json` laden (nicht hardcoden).
3. Design-Tokens aus `data/design-tokens.json` als CSS-Variablen / Tailwind-Theme übernehmen.
4. Warenkorb-State via React Context (oder Zustand) statt globalem Objekt.
5. Responsiv + a11y-Floor halten: sichtbarer Fokus, `prefers-reduced-motion`, Tastaturbedienung des Drawers.
6. Kein echtes Payment. Checkout bleibt ein Demo-Schritt (später optional Orderbird/Stripe-Anbindung).

### Bewusst offen gelassen (nächste Iterationen)
- Ansichten **02 iPad-Dispo** und **03 Fahrer-App** (nur Umschalter vorhanden).
- Echte Karte/Tracking (aktuell dekorative SVG-Animation).
- Impressum/Datenschutz/AGB-Inhalte.
- Alters-/Adress-/Bezahl-Schritt im Checkout.

---

## 4. Wichtige Werte (nicht ändern ohne Rücksprache)

| Wert | Inhalt |
|------|--------|
| Lieferung Stadtgebiet | 3,00 € |
| Lieferung bis 5 km | 7,00 € |
| Mindestbestellwert | 9,00 € |
| Öffnungszeiten | So–Do 20–02 · Fr–Sa 20–04 |
| Telefon | 0170 6179083 |
| Betreiber | GetränkeTaxi & More · Inh. Mike Gloe |
| Ort | Greifswald + Umgebung |

---

## 5. Arbeitsweise

- Prototyp-first ist bereits erledigt → jetzt Next.js-Rebuild.
- Kurze Richtungs-Feedbacks („weiter“) bedeuten: autonom sinnvolle Design-Entscheidung treffen und fortfahren.
- Bei Assets (echte Produktfotos, Logo) Base64/`/public` sauber trennen.
