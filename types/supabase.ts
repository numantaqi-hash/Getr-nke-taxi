// ==========================================================================
// Wiederverwendbare Typ-Helfer über der generierten Database-Definition.
// Beispiel:  type Order = Tables<'orders'>
// ==========================================================================
import type { Database } from "@/types/database";

type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"];

export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];

export type Views<T extends keyof PublicSchema["Views"]> =
  PublicSchema["Views"][T]["Row"];

export type Enums<T extends keyof PublicSchema["Enums"]> =
  PublicSchema["Enums"][T];

// Bequeme Aliase für die App
export type Customer = Tables<"customers">;
export type Driver = Tables<"drivers">;
export type Vehicle = Tables<"vehicles">;
export type Order = Tables<"orders">;
export type OrderItem = Tables<"order_items">;
export type LiveLocation = Tables<"live_locations">;

export type UserRole = Enums<"user_role">;
export type DriverStatus = Enums<"driver_status">;
export type DeliveryZone = Enums<"delivery_zone">;
export type OrderStatus = Enums<"order_status">;
export type PaymentStatus = Enums<"payment_status">;
export type PaymentMethod = Enums<"payment_method">;

// Bestellung inkl. Positionen (z. B. für die Bestellhistorie)
export type OrderWithItems = Order & { order_items: OrderItem[] };

// Warenkorb-Position, wie sie an place_order() übergeben wird
export type CartItemInput = {
  product_id: string;
  name: string;
  unit_price: number;
  quantity: number;
};
