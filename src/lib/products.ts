import { supabaseAdmin, type Product } from './supabase';

export async function getActiveProducts(): Promise<Product[]> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from('products')
    .select('*, product_images(*)')
    .eq('active', true)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data as Product[];
}

export function imageForRole(product: Product, role: string, fallback = ''): string {
  const img = product.product_images?.find((i) => i.role === role) ?? product.product_images?.[0];
  return img?.url ?? fallback;
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}
