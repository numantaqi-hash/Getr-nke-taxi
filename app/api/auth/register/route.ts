import { createClient } from "@/lib/supabase/server";
import { ok, fail, readJson } from "@/lib/api";
import type { UserRole } from "@/types/supabase";

export const dynamic = "force-dynamic";

type Body = {
  email?: string;
  password?: string;
  role?: UserRole;
  full_name?: string;
  phone?: string;
};

// POST /api/auth/register – Registrierung als Kunde ODER Fahrer.
// Der DB-Trigger handle_new_user() legt automatisch das passende Profil an.
export async function POST(req: Request) {
  const body = await readJson<Body>(req);
  if (!body) return fail("Ungültiger Request-Body");

  const { email, password, full_name, phone } = body;
  const role: UserRole = body.role === "driver" ? "driver" : "customer";

  if (!email || !password) return fail("E-Mail und Passwort sind erforderlich");
  if (password.length < 6) return fail("Passwort muss mind. 6 Zeichen haben");

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        full_name: full_name ?? null,
        phone: phone ?? null,
      },
    },
  });

  if (error) return fail(error.message, 400);

  return ok(
    {
      user: data.user,
      session: data.session,
      role,
      // Ohne Session ist E-Mail-Bestätigung aktiv (siehe Supabase Auth-Settings).
      needsEmailConfirmation: !data.session,
    },
    201
  );
}
