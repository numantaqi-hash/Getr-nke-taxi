import { createClient } from "@/lib/supabase/server";
import { ok, fail, readJson } from "@/lib/api";
import { resolveRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Body = { email?: string; password?: string };

// POST /api/auth/login – Login für Kunden & Fahrer (Session via Cookies).
export async function POST(req: Request) {
  const body = await readJson<Body>(req);
  if (!body?.email || !body?.password)
    return fail("E-Mail und Passwort sind erforderlich");

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: body.email,
    password: body.password,
  });

  if (error) return fail(error.message, 401);

  const role = data.user ? await resolveRole(supabase, data.user) : null;
  return ok({ user: data.user, role });
}
