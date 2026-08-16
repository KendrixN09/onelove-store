# One Love Co. — storefront

Real Stripe checkout, Supabase-backed order/product database, password-protected admin dashboard at `/admin`.

## 1. Create your accounts (you do this — I can't create accounts on your behalf)

- **Supabase**: https://supabase.com → New project. Free tier is plenty to start.
- **Stripe**: https://dashboard.stripe.com/register → complete business + bank details for payouts.
- **Vercel**: https://vercel.com → sign up (GitHub login is easiest).

## 2. Set up the database

In your Supabase project: **SQL Editor → New query**, paste the entire contents of `supabase/schema.sql`, run it. This creates the `products`, `product_images`, and `orders` tables and seeds the two launch shirts.

Then **Storage → New bucket** → name it exactly `product-images` → toggle **Public bucket** on. That's where photos for future drops (added via the admin panel) get uploaded.

Grab your keys from **Project Settings → API**:
- `SUPABASE_URL` = the Project URL
- `SUPABASE_SERVICE_ROLE_KEY` = the `service_role` secret key (never the `anon` key — this one needs full write access)

## 3. Set up Stripe

- **Developers → API keys** → copy the **Secret key** → `STRIPE_SECRET_KEY`
- You'll add the webhook signing secret *after* the first deploy (step 5), since it needs your live URL.

## 4. Push this to GitHub, then import to Vercel

```bash
cd onelove-store
git init
git add .
git commit -m "Initial storefront"
```

Create a new empty repo on GitHub, then:

```bash
git remote add origin <your-repo-url>
git push -u origin main
```

In Vercel: **Add New → Project** → import that GitHub repo. Before the first deploy, add these environment variables (Vercel project → Settings → Environment Variables):

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `ADMIN_PASSWORD` — pick a real password, this is the only login for `/admin`
- `ADMIN_SESSION_SECRET` — any long random string (e.g. run `openssl rand -hex 32`)

Deploy.

## 5. Connect the Stripe webhook (do this after the first deploy)

Stripe needs to tell your app when someone actually pays — this is what turns a checkout into a real order in your dashboard.

- **Stripe Dashboard → Developers → Webhooks → Add endpoint**
- Endpoint URL: `https://<your-vercel-domain>/api/webhooks/stripe`
- Event to send: `checkout.session.completed`
- Copy the **Signing secret** (starts with `whsec_`) → add it to Vercel as `STRIPE_WEBHOOK_SECRET` → redeploy (Vercel → Deployments → ⋯ → Redeploy) so the new env var takes effect.

## 6. Custom domain

Vercel → your project → **Settings → Domains** → add your domain. Vercel gives you the DNS records to add at your registrar (GoDaddy, Namecheap, etc.).

## Using the admin dashboard

Go to `https://<your-domain>/admin`, log in with `ADMIN_PASSWORD`.

- **Orders tab** — every paid order, with payment status (from Stripe) and an editable shipment status + tracking number.
- **Products tab** — deactivate a sold-out piece, or **+ Add product** to launch a new drop (name, price, description, colorway swatches, photo) — goes live on the storefront immediately, no code changes or redeploy needed.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in the values above
npm run dev
```

Stripe webhooks don't reach `localhost` directly — for local testing, install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and run `stripe listen --forward-to localhost:3000/api/webhooks/stripe` (it prints a webhook secret to use locally).
