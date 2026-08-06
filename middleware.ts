import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Alles außer statische Assets & Bilder (der Prototyp bleibt unberührt).
    "/((?!_next/static|_next/image|favicon.ico|assets/|prototype/|index.html|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
