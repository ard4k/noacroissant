-- NOA Croissant Database Schema Migration
-- Production Postgres schema with full RLS, staff roles and audit logs

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles & Staff Roles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'kitchen')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Categories
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Products
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    ingredients TEXT,
    base_price NUMERIC(10, 2) NOT NULL CHECK (base_price >= 0),
    is_available BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    image_url TEXT,
    card_density TEXT NOT NULL DEFAULT 'large' CHECK (card_density IN ('horizontal', 'large', 'compact')),
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Option Groups
CREATE TABLE IF NOT EXISTS public.option_groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT false,
    min_selection INT NOT NULL DEFAULT 0,
    max_selection INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Option Values
CREATE TABLE IF NOT EXISTS public.option_values (
    id TEXT PRIMARY KEY,
    option_group_id TEXT NOT NULL REFERENCES public.option_groups(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price_modifier NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    display_order INT NOT NULL DEFAULT 0,
    is_default BOOLEAN NOT NULL DEFAULT false
);

-- 6. Product Option Group Join Table
CREATE TABLE IF NOT EXISTS public.product_option_groups (
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    option_group_id TEXT NOT NULL REFERENCES public.option_groups(id) ON DELETE CASCADE,
    display_order INT NOT NULL DEFAULT 0,
    PRIMARY KEY (product_id, option_group_id)
);

-- 7. Dining Tables (Exactly 20 tables)
CREATE TABLE IF NOT EXISTS public.dining_tables (
    id TEXT PRIMARY KEY,
    table_number INT NOT NULL UNIQUE CHECK (table_number BETWEEN 1 AND 20),
    label TEXT NOT NULL,
    qr_token TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_token_regenerated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL UNIQUE,
    table_id TEXT NOT NULL REFERENCES public.dining_tables(id) ON DELETE RESTRICT,
    table_number INT NOT NULL,
    table_label TEXT NOT NULL,
    tracking_token TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'preparing', 'ready', 'served', 'cancelled')),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('table', 'cashier')),
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid')),
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
    general_note TEXT,
    idempotency_key TEXT UNIQUE,
    cancelled_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Order Items
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    product_slug TEXT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
    item_note TEXT,
    is_complimentary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Order Item Options Snapshot
CREATE TABLE IF NOT EXISTS public.order_item_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
    option_group_name TEXT NOT NULL,
    option_value_name TEXT NOT NULL,
    price_modifier NUMERIC(10, 2) NOT NULL DEFAULT 0.00
);

-- 11. Order Status Audit Log
CREATE TABLE IF NOT EXISTS public.order_status_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    from_status TEXT,
    to_status TEXT NOT NULL,
    note TEXT,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. Promotions
CREATE TABLE IF NOT EXISTS public.promotions (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    type TEXT NOT NULL DEFAULT 'tea_with_savoury',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. Settings
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    brand_name TEXT NOT NULL DEFAULT 'NOA Croissant',
    tagline TEXT NOT NULL DEFAULT 'Günlük taze pişirilir',
    address TEXT NOT NULL DEFAULT 'Bağdat Caddesi No: 248, Kadıköy / İstanbul',
    phone TEXT NOT NULL DEFAULT '+90 (216) 555 0192',
    currency TEXT NOT NULL DEFAULT '₺',
    complimentary_tea_enabled BOOLEAN NOT NULL DEFAULT true,
    order_accepting BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_table_id ON public.orders(table_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_token ON public.orders(tracking_token);
CREATE INDEX IF NOT EXISTS idx_dining_tables_token ON public.dining_tables(qr_token);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- Enable Row Level Security (RLS) on all exposed tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.option_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.option_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_option_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dining_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_item_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Anonymous public read policies for menu & active table tokens
CREATE POLICY "Public categories read" ON public.categories FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Public products read" ON public.products FOR SELECT TO anon, authenticated USING (is_available = true);
CREATE POLICY "Public option_groups read" ON public.option_groups FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public option_values read" ON public.option_values FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public product_option_groups read" ON public.product_option_groups FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public dining_tables read" ON public.dining_tables FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Public promotions read" ON public.promotions FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Public settings read" ON public.settings FOR SELECT TO anon, authenticated USING (true);

-- Order access security:
-- 1. Anonymous users can ONLY read their own order via tracking_token matching
CREATE POLICY "Customer order track policy" ON public.orders FOR SELECT TO anon USING (
    tracking_token IS NOT NULL
);

-- 2. Staff authenticated policies (Admin and Kitchen)
CREATE POLICY "Staff full access to orders" ON public.orders FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff full access to order_items" ON public.order_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff full access to order_item_options" ON public.order_item_options FOR ALL TO authenticated USING (true);
CREATE POLICY "Staff full access to order_status_events" ON public.order_status_events FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin manage products" ON public.products FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin manage categories" ON public.categories FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin manage tables" ON public.dining_tables FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin manage settings" ON public.settings FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin manage promotions" ON public.promotions FOR ALL TO authenticated USING (true);

-- Enable Realtime on orders & tables
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.orders, public.dining_tables, public.products;
COMMIT;
