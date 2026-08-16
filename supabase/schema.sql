-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New query).

create extension if not exists "pgcrypto";

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  price_cents integer not null,
  description text not null default '',
  swatch_hex_1 text not null default '#15120F',
  swatch_hex_2 text not null default '#EDE7DA',
  category text not null default 'apparel',
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  role text not null default 'card', -- 'hero' | 'card' | 'detail' | 'lookbook'
  sort_order integer not null default 0
);

-- Orders store a SNAPSHOT of what was purchased (name/price/image at time of
-- sale), not a live foreign-key join to products - so editing or discontinuing
-- a product later never changes historical order records.
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  stripe_session_id text unique,
  stripe_payment_intent text,
  customer_email text,
  customer_name text,
  shipping_address jsonb,
  items jsonb not null,               -- [{ product_id, name, price_cents, qty, image_url }]
  amount_total_cents integer not null default 0,
  payment_status text not null default 'pending', -- pending | paid | refunded
  shipment_status text not null default 'pending', -- pending | shipped | delivered
  tracking_number text,
  tracking_carrier text
);

create index if not exists idx_products_active on products(active, sort_order);
create index if not exists idx_orders_created on orders(created_at desc);

-- Seed the two launch products (Capsule 1). Add future drops the same way,
-- or through the admin dashboard's "Add product" form once that's live.
insert into products (name, slug, price_cents, description, swatch_hex_1, swatch_hex_2, sort_order)
values
  ('Black & White Polo', 'black-and-white-polo', 10000, 'Vegan leather colorblock panels over heavyweight jersey. Oversized, dropped shoulder. "One Love" embroidered over the heart.', '#15120F', '#EDE7DA', 1),
  ('Crème & Brown Polo', 'creme-and-brown-polo', 10000, 'Vegan leather colorblock panels over heavyweight jersey. Oversized, dropped shoulder. "One Love" embroidered over the heart.', '#5A3823', '#F5F1E7', 2)
on conflict (slug) do nothing;

-- Image rows for the seed products, pointing at the static files shipped in
-- /public/images for this launch drop. Future products added via the admin
-- panel will instead point at Supabase Storage URLs - the frontend doesn't
-- care which, it just renders whatever url is here.
insert into product_images (product_id, url, role, sort_order)
select id, '/images/hero-bw.jpg', 'hero', 1 from products where slug = 'black-and-white-polo'
union all
select id, '/images/card-bw.jpg', 'card', 1 from products where slug = 'black-and-white-polo'
union all
select id, '/images/hero-bc.jpg', 'hero', 1 from products where slug = 'creme-and-brown-polo'
union all
select id, '/images/card-bc.jpg', 'card', 1 from products where slug = 'creme-and-brown-polo';
