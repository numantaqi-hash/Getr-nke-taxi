import { createClient } from "@/lib/supabase/server";
import { ok, unauthorized } from "@/lib/api";
import { getAuthUser, resolveRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/auth/user – aktueller User + Rolle.
export async function GET() {
  const supabase = createClient();
  const user = await getAuthUser(supabase);
  if (!user) return unauthorized();

  const role = await resolveRole(supabase, user);
  return ok({ user, role });
}
