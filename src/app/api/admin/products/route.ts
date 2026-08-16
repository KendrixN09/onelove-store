import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Lists every product regardless of active state, for the admin catalog view
// (the public getActiveProducts() in src/lib/products.ts only returns active
// ones - the storefront should never show a deactivated/sold-out drop).
export async function GET() {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from('products')
    .select('*, product_images(*)')
    .order('sort_order', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products: data });
}

type NewProduct = {
  name: string;
  price_cents: number;
  description?: string;
  swatch_hex_1?: string;
  swatch_hex_2?: string;
  images: { url: string; role: 'hero' | 'card' | 'detail' | 'lookbook' }[];
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as NewProduct;
  if (!body.name || !body.price_cents || !body.images?.length) {
    return NextResponse.json({ error: 'Name, price, and at least one image are required' }, { status: 400 });
  }

  const slug = body.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const db = supabaseAdmin();

  const { data: maxSort } = await db.from('products').select('sort_order').order('sort_order', { ascending: false }).limit(1).single();
  const nextSort = (maxSort?.sort_order ?? 0) + 1;

  const { data: product, error } = await db
    .from('products')
    .insert({
      name: body.name,
      slug,
      price_cents: body.price_cents,
      description: body.description ?? '',
      swatch_hex_1: body.swatch_hex_1 ?? '#15120F',
      swatch_hex_2: body.swatch_hex_2 ?? '#EDE7DA',
      sort_order: nextSort,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const imageRows = body.images.map((img, i) => ({
    product_id: product.id,
    url: img.url,
    role: img.role,
    sort_order: i,
  }));
  const { error: imgError } = await db.from('product_images').insert(imageRows);
  if (imgError) return NextResponse.json({ error: imgError.message }, { status: 500 });

  return NextResponse.json({ product });
}

export async function PATCH(req: NextRequest) {
  const body = (await req.json()) as { id: string; active?: boolean; price_cents?: number; description?: string };
  if (!body.id) return NextResponse.json({ error: 'Missing product id' }, { status: 400 });

  const update: Record<string, unknown> = {};
  if (body.active !== undefined) update.active = body.active;
  if (body.price_cents !== undefined) update.price_cents = body.price_cents;
  if (body.description !== undefined) update.description = body.description;

  const db = supabaseAdmin();
  const { error } = await db.from('products').update(update).eq('id', body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
