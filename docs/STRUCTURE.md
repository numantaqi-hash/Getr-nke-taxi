# Seitenaufbau (Kunden-Shop)

Reihenfolge der Sektionen im Prototyp, von oben nach unten:

1. **Demo-Leiste** (`.demobar`) — Hinweis „Konzept-Prototyp“ + Ansicht-Umschalter (01/02/03) + „System online“.
2. **Header** (`header > .nav`) — Logo (GT-Badge + Wortmarke), Nav-Links, Öffnungszeiten, Warenkorb-Button.
3. **Hero** (`.hero`) — zweispaltig:
   - links: Location-Badge, H1, Lead, CTAs (Bestellen / Anruf), 3 Stats.
   - rechts: **Live-Tracking-Karte** (LIVE-Badge, Status, ETA, animierte SVG-Route, „PARTY READY“).
4. **Service-Strip** (`.strip`) — 4 Zellen: Stadtgebiet 3€ / bis 5km 7€ / weiter individuell / Jetzt geöffnet.
5. **Sortiment** (`.menu#sortiment`) — Eyebrow, H2 „Was darf's sein?“, Suchfeld, Filter-Chips, Produkt-Grid.
6. **So geht's** (`.how#how`) — Eyebrow, H2 „Drei Schritte. Ein kaltes Getränk.“, 3 Schritt-Karten (Auswählen / Sicher bestellen / Zurücklehnen).
7. **Footer** — Logo, Betreiberinfo, Rechtslinks (Impressum/Datenschutz/AGB), Copyright/Demo-Hinweis.

**Overlays / global:**
- Sticky Cart-Bar unten (erscheint ab 1 Artikel).
- Cart-Drawer rechts (Overlay + Panel).
- Toast (unten mittig).

## Interaktions-Map
| Element | Verhalten |
|---------|-----------|
| Produkt „+“ | `inc(id)` → Artikel + Toast, Karte zeigt Stepper |
| Stepper −/+ | `dec` / `inc`, entfernt bei 0 |
| Filter-Chip | `setCat` → filtert Grid nach `data-cat` |
| Suchfeld | `applyFilters` → filtert nach Name/Beschreibung |
| Warenkorb-Button / Cart-Bar | `openCart` → Drawer + Overlay |
| Checkout | `checkout` (Demo-Toast), gesperrt unter 9€ |
| Ansicht 02/03 | `soon` → Toast „Ansicht folgt“ |
| Escape | schließt Drawer |
