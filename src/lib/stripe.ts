import Stripe from 'stripe';

let client: Stripe | null = null;

// Lazily constructed so a missing key only breaks the specific request that
// needed Stripe, not the whole app (e.g. static pages that don't touch
// checkout should still build/render fine without STRIPE_SECRET_KEY set).
export function stripeClient(): Stripe {
  if (client) return client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('Missing STRIPE_SECRET_KEY');
  client = new Stripe(key, { apiVersion: '2024-06-20' });
  return client;
}
