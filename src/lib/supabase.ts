import { createClient } from '@supabase/supabase-js';

// Service-role client: server-side only (API routes), full read/write access,
// bypasses row-level security. Never import this into a client component -
// the service key must never reach the browser.
export function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, key, { auth: { persistSession: false } });
}

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  role: 'hero' | 'card' | 'detail' | 'lookbook';
  sort_order: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  price_cents: number;
  description: string;
  swatch_hex_1: string;
  swatch_hex_2: string;
  category: string;
  active: boolean;
  sort_order: number;
  created_at: string;
  product_images?: ProductImage[];
};

export type OrderItem = {
  product_id: string;
  name: string;
  size: string | null;
  price_cents: number;
  qty: number;
  image_url: string | null;
};

export type Order = {
  id: string;
  created_at: string;
  updated_at: string;
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  customer_email: string | null;
  customer_name: string | null;
  shipping_address: Record<string, unknown> | null;
  items: OrderItem[];
  amount_total_cents: number;
  payment_status: 'pending' | 'paid' | 'refunded';
  shipment_status: 'pending' | 'shipped' | 'delivered';
  tracking_number: string | null;
  tracking_carrier: string | null;
};
