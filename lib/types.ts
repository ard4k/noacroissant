export type OrderStatus = "received" | "preparing" | "ready" | "served" | "cancelled";
export type PaymentMethod = "credit_card" | "cash" | "table" | "cashier";
export type PaymentStatus = "unpaid" | "paid";
export type StaffRole = "admin" | "kitchen";
export type CardDensity = "horizontal" | "large" | "compact";

export interface Category {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  is_active: boolean;
}

export interface OptionValue {
  id: string;
  option_group_id: string;
  name: string;
  price_modifier: number;
  display_order: number;
  is_default?: boolean;
}

export interface OptionGroup {
  id: string;
  name: string;
  display_name: string;
  is_required: boolean;
  min_selection: number;
  max_selection: number;
  options: OptionValue[];
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description?: string;
  ingredients?: string;
  base_price: number;
  is_available: boolean;
  is_featured?: boolean;
  image_url?: string;
  display_order: number;
  card_density: CardDensity;
  option_groups?: OptionGroup[];
}

export interface DiningTable {
  id: string;
  table_number: number; // 1 to 20
  label: string; // "Masa 01", etc.
  qr_token: string;
  is_active: boolean;
  created_at?: string;
  last_token_regenerated_at?: string;
}

export interface CartItemOption {
  option_group_id: string;
  option_group_name: string;
  option_value_id: string;
  option_value_name: string;
  price_modifier: number;
}

export interface CartItem {
  id: string; // unique item id in cart (uuid or composed)
  product_id: string;
  product_name: string;
  product_slug: string;
  product_image?: string;
  base_price: number;
  selected_options: CartItemOption[];
  quantity: number;
  item_note?: string;
  unit_price: number;
  total_price: number;
  is_complimentary?: boolean;
}

export interface CartState {
  items: CartItem[];
  general_note?: string;
  table_token?: string;
  table_number?: number;
  complimentary_tea_claimed?: boolean;
}

export interface OrderItemRecord {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_slug?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  item_note?: string;
  is_complimentary?: boolean;
  options: {
    option_group_name: string;
    option_value_name: string;
    price_modifier: number;
  }[];
}

export interface OrderStatusEvent {
  id: string;
  order_id: string;
  from_status: OrderStatus | null;
  to_status: OrderStatus;
  note?: string;
  created_by?: string;
  created_at: string;
}

export interface OrderRecord {
  id: string;
  order_number: string; // e.g. "NOA-0820-001"
  table_id: string;
  table_number: number;
  table_label: string;
  tracking_token: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  subtotal: number;
  total: number;
  general_note?: string;
  idempotency_key?: string;
  created_at: string;
  updated_at: string;
  cancelled_reason?: string;
  items: OrderItemRecord[];
  status_history?: OrderStatusEvent[];
}

export interface Promotion {
  id: string;
  code: string;
  title: string;
  description: string;
  is_active: boolean;
  type: "tea_with_savoury";
}

export interface BusinessSettings {
  brand_name: string;
  tagline: string;
  address: string;
  phone: string;
  currency: string;
  complimentary_tea_enabled: boolean;
  order_accepting: boolean;
  venue_name?: string;
  currency_symbol?: string;
  service_hours_start?: string;
  service_hours_end?: string;
  allow_table_orders?: boolean;
  allow_takeaway?: boolean;
  sound_notifications_enabled?: boolean;
  table_count?: number;
}
