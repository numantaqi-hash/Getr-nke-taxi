// Kleine Helfer für einheitliche JSON-Antworten in den API-Routen.
import { NextResponse } from "next/server";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export const unauthorized = () => fail("Nicht angemeldet", 401);
export const forbidden = (msg = "Kein Zugriff") => fail(msg, 403);

export async function readJson<T = unknown>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}
