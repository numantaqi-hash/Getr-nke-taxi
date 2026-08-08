import { createClient } from "@/lib/supabase/server";
import { ok, fail, unauthorized } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/customer/tracking – aktive Bestellung des Kunden + letzte Fahrer-Position.
export async function GET() {
  const supabase = createClient();
  const user = await getAuthUser(supabase);
  if (!user) return unauthorized();

  // Neueste, noch nicht abgeschlossene Bestellung.
  const { data: order, error } = await supabase
    .from("orders")
    .select("id, order_number, status, driver_id, address, delivery_zone")
    .eq("customer_id", user.id)
    .not("status", "in", "(delivered,cancelled)")
    .order("placed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return fail(error.message, 400);
  if (!order) return ok({ order: null, driver_location: null });

  let driver_location = null;
  if (order.driver_id) {
    const { data: loc } = await supabase
      .from("live_locations")
      .select("lat, lng, heading, recorded_at")
      .eq("driver_id", order.driver_id)
      .order("recorded_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    driver_location = loc ?? null;
  }

  return ok({ order, driver_location });
}
