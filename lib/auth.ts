// Auth-Helfer für Route Handlers: aktuellen User + Rolle ermitteln.
import type { User } from "@supabase/supabase-js";
import type { UserRole } from "@/types/supabase";
import type { createClient } from "@/lib/supabase/server";

// Exakt der Client-Typ, den unsere Factory liefert -> keine Generics-Divergenz.
type DB = ReturnType<typeof createClient>;

export async function getAuthUser(supabase: DB): Promise<User | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// Rolle aus den Signup-Metadaten (schnell, ohne DB-Query).
export function roleOf(user: User | null): UserRole | null {
  const role = user?.user_metadata?.role;
  return role === "customer" || role === "driver" ? role : null;
}

// Fällt auf eine DB-Prüfung zurück, falls die Metadaten fehlen.
export async function resolveRole(
  supabase: DB,
  user: User
): Promise<UserRole | null> {
  const fromMeta = roleOf(user);
  if (fromMeta) return fromMeta;

  const { data: driver } = await supabase
    .from("drivers")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (driver) return "driver";

  const { data: customer } = await supabase
    .from("customers")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (customer) return "customer";

  return null;
}
