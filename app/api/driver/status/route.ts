import { createClient } from "@/lib/supabase/server";
import { ok, fail, unauthorized, forbidden, readJson } from "@/lib/api";
import { getAuthUser, resolveRole } from "@/lib/auth";
import type { DriverStatus } from "@/types/supabase";

export const dynamic = "force-dynamic";

const ALLOWED: DriverStatus[] = ["offline", "online", "on_delivery"];

type Body = { status?: DriverStatus };

// GET /api/driver/status – aktuelles Fahrerprofil (inkl. Status).
export async function GET() {
  const supabase = createClient();
  const user = await getAuthUser(supabase);
  if (!user) return unauthorized();
  if ((await resolveRole(supabase, user)) !== "driver")
    return forbidden("Nur für Fahrer");

  const { data, error } = await supabase
    .from("drivers")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) return fail(error.message, 400);
  return ok({ driver: data });
}

// PATCH /api/driver/status – Fahrer geht Online / Offline / On Delivery.
export async function PATCH(req: Request) {
  const supabase = createClient();
  const user = await getAuthUser(supabase);
  if (!user) return unauthorized();
  if ((await resolveRole(supabase, user)) !== "driver")
    return forbidden("Nur für Fahrer");

  const body = await readJson<Body>(req);
  if (!body?.status || !ALLOWED.includes(body.status))
    return fail("status muss offline, online oder on_delivery sein");

  const { data, error } = await supabase
    .from("drivers")
    .update({ status: body.status, is_available: body.status !== "offline" })
    .eq("id", user.id)
    .select("*")
    .single();

  if (error) return fail(error.message, 400);
  return ok({ driver: data });
}
