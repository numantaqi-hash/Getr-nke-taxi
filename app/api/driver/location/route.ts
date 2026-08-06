import { createClient } from "@/lib/supabase/server";
import { ok, fail, unauthorized, forbidden, readJson } from "@/lib/api";
import { getAuthUser, resolveRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Body = {
  lat?: number;
  lng?: number;
  heading?: number;
  speed?: number;
  accuracy?: number;
  order_id?: string;
};

// POST /api/driver/location – GPS-Punkt speichern (Basis für Live-Tracking).
export async function POST(req: Request) {
  const supabase = createClient();
  const user = await getAuthUser(supabase);
  if (!user) return unauthorized();
  if ((await resolveRole(supabase, user)) !== "driver")
    return forbidden("Nur für Fahrer");

  const body = await readJson<Body>(req);
  if (
    !body ||
    typeof body.lat !== "number" ||
    typeof body.lng !== "number" ||
    Number.isNaN(body.lat) ||
    Number.isNaN(body.lng)
  ) {
    return fail("lat und lng (Zahlen) sind erforderlich");
  }

  const { data, error } = await supabase
    .from("live_locations")
    .insert({
      driver_id: user.id,
      order_id: body.order_id ?? null,
      lat: body.lat,
      lng: body.lng,
      heading: body.heading ?? null,
      speed: body.speed ?? null,
      accuracy: body.accuracy ?? null,
    })
    .select("*")
    .single();

  if (error) return fail(error.message, 400);
  return ok({ location: data }, 201);
}

// GET /api/driver/location – letzter eigener GPS-Punkt.
export async function GET() {
  const supabase = createClient();
  const user = await getAuthUser(supabase);
  if (!user) return unauthorized();

  const { data, error } = await supabase
    .from("live_locations")
    .select("*")
    .eq("driver_id", user.id)
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return fail(error.message, 400);
  return ok({ location: data });
}
