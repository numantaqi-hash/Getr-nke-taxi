# Next.js 14 Rebuild — empfohlener Plan

Stack: **Next.js 14 (App Router) · TypeScript · Tailwind CSS · React Context** für den Warenkorb.

## Vorgeschlagene Struktur

```
app/
  layout.tsx            # Fonts (next/font), <html lang="de">, globale Provider
  page.tsx              # setzt Sektionen zusammen
  globals.css           # CSS-Variablen aus design-tokens.json + Tailwind @layer

components/
  DemoBar.tsx           # Prototyp-Hinweis + Ansicht-Umschalter (Client)
  SiteHeader.tsx        # Logo, Nav, Öffnungszeiten, Cart-Button
  Hero.tsx              # Headline + CTAs + Stats
  TrackingCard.tsx      # animierte Live-Karte (SVG + offset-path)
  ServiceStrip.tsx      # 4 Lieferzonen-Zellen
  Menu/
    MenuSection.tsx     # Wrapper: Suche + Filter + Grid
    SearchBox.tsx
    FilterChips.tsx
    ProductCard.tsx     # Karte inkl. Stepper / Add-Button
  HowItWorks.tsx        # 3 Schritte
  SiteFooter.tsx
  cart/
    CartProvider.tsx    # Context: items, add, remove, totals, minOrder-Check
    CartBar.tsx         # sticky mobile bar
    CartDrawer.tsx      # Drawer + Overlay + Checkout (Demo)
    Toast.tsx / useToast.ts

lib/
  data.ts               # lädt products.json (typisiert), Euro-Formatter
  types.ts              # Product, Category, CartItem, DeliveryZone

public/                 # später: Logo, echte Produktbilder
```

## Warenkorb-Logik (aus Prototyp übernehmen)
- Lieferung Stadtgebiet **3,00 €**, Mindestbestellwert **9,00 €**.
- `total = itemsSum > 0 ? itemsSum + delivery : 0`.
- Checkout gesperrt, solange `itemsSum < 9`.
- Euro-Format: deutsches Komma (`2,70 €`).

## Design-Tokens → globals.css
Farben/Radien/Shadow aus `data/design-tokens.json` als `:root`-CSS-Variablen setzen,
dann in `tailwind.config.ts` unter `theme.extend.colors` spiegeln.
Gradient `--grad` als Utility (`.text-grad` / `.bg-grad`) bereitstellen.

## Fonts
`next/font/google`: Display = **Oswald** oder **Anton** (kondensierter Grotesk-Look, ersetzt Bahnschrift),
Body = **Inter**. Als CSS-Variablen `--font-display` / `--font-body` exportieren.

## a11y / Qualitätsfloor
- Sichtbarer `:focus-visible`, Drawer per Tastatur schließbar (Escape), Fokus-Falle im offenen Drawer.
- `prefers-reduced-motion`: Auto-Fahrt & Transitions abschalten.
- Responsiv bis ~360px (Cart-Bar + einspaltiges Grid).

## Reihenfolge der Umsetzung (Vorschlag)
1. Tokens + Layout + Fonts, leere Sektionen.
2. Header + Hero + TrackingCard.
3. Menu (Daten, Karten, Filter, Suche).
4. CartProvider → CartBar → CartDrawer → Checkout (Demo).
5. ServiceStrip, HowItWorks, Footer, DemoBar-Umschalter.
6. Feinschliff a11y + responsive + reduced-motion.
