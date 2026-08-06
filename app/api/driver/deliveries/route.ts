import { createClient } from "@/lib/supabase/server";
import { ok, fail, unauthorized, forbidden, readJson } from "@/lib/api";
import { getAuthUser, resolveRole } from "@/lib/auth";
import type { OrderStatus, TablesUpdate } from "@/types/supabase";

export const dynamic = "force-dynamic";

// Status-Schritte, die ein Fahrer auslösen darf.
const DRIVER_ALLOWED: OrderStatus[] = ["en_route", "delivered"];

// GET /api/driver/deliveries – dem Fahrer zugewiesene Lieferungen (RLS-geschützt).
// Optionaler Query-Filter: ?status=assigned|en_route|delivered ...
export async function GET(req: Request) {
  const supabase = createClient();
  const user = await getAuthUser(supabase);
  if (!user) return unauthorized();
  if ((await resolveRole(supabase, user)) !== "driver")
    return forbidden("Nur für Fahrer");

  const status = new URL(req.url).searchParams.get("status");

  let query = supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("driver_id", user.id)
    .order("assigned_at", { ascending: false, nullsFirst: false });

  if (status) query = query.eq("status", status as never);

  const { data, error } = await query;
  if (error) return fail(error.message, 400);
  return ok({ deliveries: data ?? [] });
}

type PatchBody = { order_id?: string; status?: OrderStatus };

// PATCH /api/driver/deliveries – Fahrer schreibt den Lieferstatus fort.
// RLS erlaubt nur Änderungen an der EIGENEN zugewiesenen Bestellung.
export async function PATCH(req: Request) {
  const supabase = createClient();
  const user = await getAuthUser(supabase);
  if (!user) return unauthorized();
  if ((await resolveRole(supabase, user)) !== "driver")
    return forbidden("Nur für Fahrer");

  const body = await readJson<PatchBody>(req);
  if (!body?.order_id || !body.status)
    return fail("order_id und status sind erforderlich");
  if (!DRIVER_ALLOWED.includes(body.status))
    return fail("Fahrer dürfen nur en_route oder delivered setzen");

  const patch: TablesUpdate<"orders"> = { status: body.status };
  if (body.status === "delivered") patch.delivered_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("orders")
    .update(patch)
    .eq("id", body.order_id)
    .eq("driver_id", user.id)
    .select("*")
    .maybeSingle();

  if (error) return fail(error.message, 400);
  if (!data) return fail("Lieferung nicht gefunden oder nicht dir zugewiesen", 404);
  return ok({ order: data });
}
