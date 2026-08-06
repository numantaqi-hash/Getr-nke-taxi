// Supabase-Client für Server-Komponenten & Route Handlers.
// Bindet die Session an die Request-Cookies -> RLS läuft als eingeloggter User.
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { getSupabaseEnv } from "@/lib/env";

export function createClient() {
  const cookieStore = cookies();
  const { url, anonKey } = getSupabaseEnv();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: { name: string; value: string; options: CookieOptions }[]
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // In Server-Komponenten ist set() nicht erlaubt – die Middleware
          // aktualisiert die Session dort. Bewusst ignoriert.
        }
      },
    },
  });
}
