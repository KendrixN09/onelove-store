import { NextRequest, NextResponse } from 'next/server';
import { stripeClient } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';

type CartLine = { productId: string; qty: number };

// Prices are re-read from the database here, never trusted from the client -
// a request could otherwise claim any price it wants for a given product id.
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { items: CartLine[] };
    const items = (body.items ?? []).filter((i) => i.qty > 0);
    if (items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const db = supabaseAdmin();
    const ids = items.map((i) => i.productId);
    const { data: products, error } = await db
      .from('products')
      .select('*, product_images(*)')
      .in('id', ids)
      .eq('active', true);
    if (error) throw error;
    if (!products || products.length !== ids.length) {
      return NextResponse.json({ error: 'One or more items are no longer available' }, { status: 400 });
    }

    const origin = req.headers.get('origin') ?? new URL(req.url).origin;

    const line_items = items.map((line) => {
      const product = products.find((p) => p.id === line.productId)!;
      const image = product.product_images?.find((im: { role: string }) => im.role === 'card')?.url
        ?? product.product_images?.[0]?.url;
      return {
        quantity: line.qty,
        price_data: {
          currency: 'usd',
          unit_amount: product.price_cents,
          product_data: {
            name: product.name,
            images: image ? [new URL(image, origin).toString()] : undefined,
            metadata: { product_id: product.id },
          },
        },
      };
    });

    const stripe = stripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      shipping_address_collection: { allowed_countries: ['US', 'CA'] },
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('checkout error', err);
    return NextResponse.json({ error: 'Could not start checkout' }, { status: 500 });
  }
}
