import { NextRequest, NextResponse } from 'next/server';
import { stripeClient } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';
import type Stripe from 'stripe';

// The webhook, not the browser landing on /success, is the actual source of
// truth for "this order was paid" - a customer closing the tab right after
// paying, or a flaky redirect, must never cost them an order. Stripe retries
// this endpoint until it gets a 2xx, so failures here are safe to retry.
export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
  }

  const rawBody = await req.text();
  const stripe = stripeClient();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('webhook signature verification failed', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    await recordOrder(session);
  }

  return NextResponse.json({ received: true });
}

async function recordOrder(session: Stripe.Checkout.Session) {
  const stripe = stripeClient();
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    expand: ['data.price.product'],
  });

  const items = lineItems.data.map((li) => {
    const product = li.price?.product as Stripe.Product | undefined;
    return {
      product_id: (product?.metadata?.product_id as string) ?? null,
      name: li.description ?? product?.name ?? 'Item',
      size: (product?.metadata?.size as string) ?? null,
      price_cents: li.price?.unit_amount ?? 0,
      qty: li.quantity ?? 1,
      image_url: product?.images?.[0] ?? null,
    };
  });

  const db = supabaseAdmin();
  const { error } = await db.from('orders').upsert(
    {
      stripe_session_id: session.id,
      stripe_payment_intent:
        typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id ?? null,
      customer_email: session.customer_details?.email ?? null,
      customer_name: session.customer_details?.name ?? null,
      shipping_address: session.shipping_details?.address ?? session.customer_details?.address ?? null,
      items,
      amount_total_cents: session.amount_total ?? 0,
      payment_status: session.payment_status === 'paid' ? 'paid' : 'pending',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'stripe_session_id' }
  );

  if (error) console.error('failed to record order', error);
}
