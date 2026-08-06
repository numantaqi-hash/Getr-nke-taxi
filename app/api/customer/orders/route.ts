import { createClient } from "@/lib/supabase/server";
import { ok, fail, unauthorized, readJson } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import type { CartItemInput, DeliveryZone, PaymentMethod } from "@/types/supabase";

export const dynamic = "force-dynamic";

// GET /api/customer/orders – Bestellhistorie inkl. Positionen (RLS: nur eigene).
export async function GET() {
  const supabase = createClient();
  const user = await getAuthUser(supabase);
  if (!user) return unauthorized();

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("customer_id", user.id)
    .order("placed_at", { ascending: false });

  if (error) return fail(error.message, 400);
  return ok({ orders: data ?? [] });
}

type CreateBody = {
  items?: CartItemInput[];
  delivery_zone?: DeliveryZone;
  address?: string;
  notes?: string;
  payment_method?: PaymentMethod;
};

// POST /api/customer/orders – Bestellung aufgeben (atomar via place_order()).
export async function POST(req: Request) {
  const supabase = createClient();
  const user = await getAuthUser(supabase);
  if (!user) return unauthorized();

  const body = await readJson<CreateBody>(req);
  if (!body?.items || !Array.isArray(body.items) || body.items.length === 0)
    return fail("Warenkorb ist leer");

  for (const item of body.items) {
    if (
      !item ||
      typeof item.unit_price !== "number" ||
      typeof item.quantity !== "number" ||
      item.quantity <= 0 ||
      !item.name
    ) {
      return fail("Ungültige Warenkorb-Position");
    }
  }

  const { data, error } = await supabase.rpc("place_order", {
    p_items: body.items,
    p_delivery_zone: body.delivery_zone ?? "city",
    p_address: body.address ?? null,
    p_notes: body.notes ?? null,
    p_payment_method: body.payment_method ?? null,
  });

  if (error) return fail(error.message, 400);
  return ok({ order: data }, 201);
}
