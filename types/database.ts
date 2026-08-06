// ==========================================================================
// GetränkeTaxi Greifswald – Datenbank-Typen (public schema)
//
// Handgepflegt passend zu supabase/migrations. Kann später 1:1 durch
// `npm run db:types` (supabase gen types) ersetzt werden – gleiche Struktur.
// ==========================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          phone: string | null;
          default_address: string | null;
          default_zone: Database["public"]["Enums"]["delivery_zone"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          phone?: string | null;
          default_address?: string | null;
          default_zone?: Database["public"]["Enums"]["delivery_zone"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          phone?: string | null;
          default_address?: string | null;
          default_zone?: Database["public"]["Enums"]["delivery_zone"];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      drivers: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          phone: string | null;
          status: Database["public"]["Enums"]["driver_status"];
          is_available: boolean;
          current_vehicle_id: string | null;
          rating: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          phone?: string | null;
          status?: Database["public"]["Enums"]["driver_status"];
          is_available?: boolean;
          current_vehicle_id?: string | null;
          rating?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          phone?: string | null;
          status?: Database["public"]["Enums"]["driver_status"];
          is_available?: boolean;
          current_vehicle_id?: string | null;
          rating?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      vehicles: {
        Row: {
          id: string;
          driver_id: string | null;
          label: string;
          plate: string | null;
          type: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          driver_id?: string | null;
          label: string;
          plate?: string | null;
          type?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          driver_id?: string | null;
          label?: string;
          plate?: string | null;
          type?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vehicles_driver_id_fkey";
            columns: ["driver_id"];
            referencedRelation: "drivers";
            referencedColumns: ["id"];
          }
        ];
      };
      orders: {
        Row: {
          id: string;
          order_number: number;
          customer_id: string | null;
          driver_id: string | null;
          status: Database["public"]["Enums"]["order_status"];
          delivery_zone: Database["public"]["Enums"]["delivery_zone"];
          delivery_fee: number;
          subtotal: number;
          total: number;
          address: string | null;
          notes: string | null;
          payment_status: Database["public"]["Enums"]["payment_status"];
          payment_method: Database["public"]["Enums"]["payment_method"] | null;
          placed_at: string;
          assigned_at: string | null;
          delivered_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id?: string | null;
          driver_id?: string | null;
          status?: Database["public"]["Enums"]["order_status"];
          delivery_zone?: Database["public"]["Enums"]["delivery_zone"];
          delivery_fee?: number;
          subtotal?: number;
          total?: number;
          address?: string | null;
          notes?: string | null;
          payment_status?: Database["public"]["Enums"]["payment_status"];
          payment_method?: Database["public"]["Enums"]["payment_method"] | null;
          placed_at?: string;
          assigned_at?: string | null;
          delivered_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string | null;
          driver_id?: string | null;
          status?: Database["public"]["Enums"]["order_status"];
          delivery_zone?: Database["public"]["Enums"]["delivery_zone"];
          delivery_fee?: number;
          subtotal?: number;
          total?: number;
          address?: string | null;
          notes?: string | null;
          payment_status?: Database["public"]["Enums"]["payment_status"];
          payment_method?: Database["public"]["Enums"]["payment_method"] | null;
          placed_at?: string;
          assigned_at?: string | null;
          delivered_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey";
            columns: ["customer_id"];
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_driver_id_fkey";
            columns: ["driver_id"];
            referencedRelation: "drivers";
            referencedColumns: ["id"];
          }
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          name: string;
          unit_price: number;
          quantity: number;
          line_total: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          name: string;
          unit_price: number;
          quantity: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          name?: string;
          unit_price?: number;
          quantity?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            referencedRelation: "orders";
            referencedColumns: ["id"];
          }
        ];
      };
      live_locations: {
        Row: {
          id: string;
          driver_id: string;
          order_id: string | null;
          lat: number;
          lng: number;
          heading: number | null;
          speed: number | null;
          accuracy: number | null;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          driver_id: string;
          order_id?: string | null;
          lat: number;
          lng: number;
          heading?: number | null;
          speed?: number | null;
          accuracy?: number | null;
          recorded_at?: string;
        };
        Update: {
          id?: string;
          driver_id?: string;
          order_id?: string | null;
          lat?: number;
          lng?: number;
          heading?: number | null;
          speed?: number | null;
          accuracy?: number | null;
          recorded_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "live_locations_driver_id_fkey";
            columns: ["driver_id"];
            referencedRelation: "drivers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "live_locations_order_id_fkey";
            columns: ["order_id"];
            referencedRelation: "orders";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      driver_current_location: {
        Row: {
          driver_id: string | null;
          order_id: string | null;
          lat: number | null;
          lng: number | null;
          heading: number | null;
          speed: number | null;
          accuracy: number | null;
          recorded_at: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      is_driver: { Args: Record<string, never>; Returns: boolean };
      is_customer: { Args: Record<string, never>; Returns: boolean };
      place_order: {
        Args: {
          p_items: Json;
          p_delivery_zone?: Database["public"]["Enums"]["delivery_zone"];
          p_address?: string | null;
          p_notes?: string | null;
          p_payment_method?:
            | Database["public"]["Enums"]["payment_method"]
            | null;
        };
        Returns: Database["public"]["Tables"]["orders"]["Row"];
      };
    };
    Enums: {
      user_role: "customer" | "driver";
      driver_status: "offline" | "online" | "on_delivery";
      delivery_zone: "city" | "5km" | "far";
      order_status:
        | "pending"
        | "confirmed"
        | "preparing"
        | "assigned"
        | "en_route"
        | "delivered"
        | "cancelled";
      payment_status: "unpaid" | "paid" | "refunded";
      payment_method: "cash" | "card" | "paypal" | "stripe";
    };
    CompositeTypes: Record<string, never>;
  };
};
