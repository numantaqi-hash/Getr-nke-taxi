import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

// Serviert den bestehenden Prototyp (index.html) auf der App-Origin,
// damit der Checkout die Session-Cookies nutzen und /api aufrufen kann.
// Die Datei bleibt unverändert die Quelle – hier wird nur <base> injiziert,
// damit relative Asset-/API-Pfade auf "/" auflösen.
export async function GET() {
  try {
    const file = path.join(process.cwd(), "index.html");
    let html = await readFile(file, "utf8");
    html = html.replace("<head>", '<head>\n<base href="/">');
    return new NextResponse(html, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  } catch {
    return NextResponse.json({ error: "Shop konnte nicht geladen werden" }, { status: 500 });
  }
}
