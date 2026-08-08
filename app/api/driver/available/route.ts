import { createClient } from "@/lib/supabase/server";
import { ok, fail, unauthorized, forbidden, readJson } from "@/lib/api";
import { getAuthUser, resolveRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/driver/available – offene, noch nicht zugewiesene Bestellungen (Pool).
export async function GET() {
  const supabase = createClient();
  const user = await getAuthUser(supabase);
  if (!user) return unauthorized();
  if ((await resolveRole(supabase, user)) !== "driver")
    return forbidden("Nur für Fahrer");

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .is("driver_id", null)
    .eq("status", "pending")
    .order("placed_at", { ascending: true });

  if (error) return fail(error.message, 400);
  return ok({ available: data ?? [] });
}

type Body = { order_id?: string };

// POST /api/driver/available – Fahrer nimmt einen offenen Auftrag an.
export async function POST(req: Request) {
  const supabase = createClient();
  const user = await getAuthUser(supabase);
  if (!user) return unauthorized();
  if ((await resolveRole(supabase, user)) !== "driver")
    return forbidden("Nur für Fahrer");

  const body = await readJson<Body>(req);
  if (!body?.order_id) return fail("order_id ist erforderlich");

  // Nur annehmen, wenn noch offen & unzugewiesen (verhindert Doppel-Annahme).
  const { data, error } = await supabase
    .from("orders")
    .update({
      driver_id: user.id,
      status: "assigned",
      assigned_at: new Date().toISOString(),
    })
    .eq("id", body.order_id)
    .is("driver_id", null)
    .eq("status", "pending")
    .select("*")
    .maybeSingle();

  if (error) return fail(error.message, 400);
  if (!data) return fail("Auftrag wurde bereits vergeben", 409);
  return ok({ order: data }, 200);
}
