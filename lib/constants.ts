// Geschäftsregeln (Single Source of Truth im Frontend/Backend).
// Muss mit data/products.json (meta) und supabase place_order() übereinstimmen.
import type { DeliveryZone } from "@/types/supabase";

export const DELIVERY_FEES: Record<DeliveryZone, number> = {
  city: 3.0,
  "5km": 7.0,
  far: 0, // individuell – wird telefonisch geklärt
};

export const MIN_ORDER = 9.0;

export const OPENING_HOURS = "So–Do 20–02 · Fr–Sa 20–04";
export const PHONE = "+491706179083";
export const PHONE_DISPLAY = "0170 6179083";

export function deliveryFeeFor(zone: DeliveryZone): number {
  return DELIVERY_FEES[zone] ?? 0;
}
