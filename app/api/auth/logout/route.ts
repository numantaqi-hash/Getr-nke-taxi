import { createClient } from "@/lib/supabase/server";
import { ok, fail } from "@/lib/api";

export const dynamic = "force-dynamic";

// POST /api/auth/logout
export async function POST() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) return fail(error.message, 400);
  return ok({ ok: true });
}
