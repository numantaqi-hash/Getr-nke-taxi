import { ok } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/health – prüft, ob die Umgebung konfiguriert ist.
export async function GET() {
  return ok({
    ok:
      Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    service: "getraenketaxi-backend",
    env: {
      supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      supabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      serviceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    },
    time: new Date().toISOString(),
  });
}
