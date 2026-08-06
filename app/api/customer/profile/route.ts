import { createClient } from "@/lib/supabase/server";
import { ok, fail, unauthorized, readJson } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import type { TablesUpdate } from "@/types/supabase";

export const dynamic = "force-dynamic";

// GET /api/customer/profile – eigenes Kundenprofil (RLS: nur eigenes).
export async function GET() {
  const supabase = createClient();
  const user = await getAuthUser(supabase);
  if (!user) return unauthorized();

  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) return fail(error.message, 400);
  if (!data) return fail("Kein Kundenprofil gefunden", 404);
  return ok({ profile: data });
}

// PATCH /api/customer/profile – Profil bearbeiten.
export async function PATCH(req: Request) {
  const supabase = createClient();
  const user = await getAuthUser(supabase);
  if (!user) return unauthorized();

  const body = await readJson<TablesUpdate<"customers">>(req);
  if (!body) return fail("Ungültiger Request-Body");

  // Nur erlaubte Felder übernehmen.
  const patch: TablesUpdate<"customers"> = {};
  if (body.full_name !== undefined) patch.full_name = body.full_name;
  if (body.phone !== undefined) patch.phone = body.phone;
  if (body.default_address !== undefined)
    patch.default_address = body.default_address;
  if (body.default_zone !== undefined) patch.default_zone = body.default_zone;

  if (Object.keys(patch).length === 0)
    return fail("Keine gültigen Felder zum Aktualisieren");

  const { data, error } = await supabase
    .from("customers")
    .update(patch)
    .eq("id", user.id)
    .select("*")
    .single();

  if (error) return fail(error.message, 400);
  return ok({ profile: data });
}
