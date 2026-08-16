'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type OrderItem = { product_id: string; name: string; price_cents: number; qty: number; image_url: string | null };
type Order = {
  id: string;
  created_at: string;
  customer_email: string | null;
  customer_name: string | null;
  items: OrderItem[];
  amount_total_cents: number;
  payment_status: 'pending' | 'paid' | 'refunded';
  shipment_status: 'pending' | 'shipped' | 'delivered';
  tracking_number: string | null;
  tracking_carrier: string | null;
};

type ProductImage = { url: string; role: string };
type Product = {
  id: string;
  name: string;
  price_cents: number;
  description: string;
  swatch_hex_1: string;
  swatch_hex_2: string;
  active: boolean;
  product_images: ProductImage[];
};

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<'orders' | 'products'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    const res = await fetch('/api/admin/orders');
    const data = await res.json();
    setOrders(data.orders ?? []);
  }
  async function loadProducts() {
    const res = await fetch('/api/admin/products');
    const data = await res.json();
    setProducts(data.products ?? []);
  }

  useEffect(() => {
    Promise.all([loadOrders(), loadProducts()]).finally(() => setLoading(false));
  }, []);

  async function updateOrder(id: string, patch: Partial<Order>) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
    await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id, ...patch }),
    });
  }

  async function toggleActive(id: string, active: boolean) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, active } : p)));
    await fetch('/api/admin/products', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id, active }),
    });
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  }

  if (loading) {
    return (
      <div className="admin-dash">
        <div className="admin-body">Loading…</div>
      </div>
    );
  }

  return (
    <div className="admin-dash">
      <div className="admin-topbar">
        <h1 className="display" style={{ fontSize: '1.4rem', margin: 0 }}>
          One Love Admin
        </h1>
        <button className="btn-ghost" onClick={logout}>
          Log out
        </button>
      </div>
      <div className="admin-tabs">
        <button className={`admin-tab${tab === 'orders' ? ' active' : ''}`} onClick={() => setTab('orders')}>
          Orders ({orders.length})
        </button>
        <button className={`admin-tab${tab === 'products' ? ' active' : ''}`} onClick={() => setTab('products')}>
          Products ({products.length})
        </button>
      </div>
      <div className="admin-body">
        {tab === 'orders' ? (
          <OrdersTable orders={orders} onUpdate={updateOrder} />
        ) : (
          <ProductsPanel products={products} onToggleActive={toggleActive} onCreated={loadProducts} />
        )}
      </div>
    </div>
  );
}

function OrdersTable({ orders, onUpdate }: { orders: Order[]; onUpdate: (id: string, patch: Partial<Order>) => void }) {
  if (orders.length === 0) return <p style={{ color: 'var(--fg-soft)' }}>No orders yet.</p>;
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="orders-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Payment</th>
            <th>Shipment</th>
            <th>Tracking</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{new Date(o.created_at).toLocaleDateString()}</td>
              <td>
                {o.customer_name ?? '—'}
                <br />
                <span style={{ color: 'var(--fg-soft)', fontSize: '0.78rem' }}>{o.customer_email}</span>
              </td>
              <td>
                {o.items.map((i) => (
                  <div key={i.product_id}>
                    {i.qty}× {i.name}
                  </div>
                ))}
              </td>
              <td style={{ fontVariantNumeric: 'tabular-nums' }}>{formatPrice(o.amount_total_cents)}</td>
              <td>
                <span className={`pill ${o.payment_status}`}>{o.payment_status}</span>
              </td>
              <td>
                <select value={o.shipment_status} onChange={(e) => onUpdate(o.id, { shipment_status: e.target.value as Order['shipment_status'] })}>
                  <option value="pending">Pending</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                </select>
              </td>
              <td>
                <input
                  type="text"
                  placeholder="Tracking number"
                  defaultValue={o.tracking_number ?? ''}
                  onBlur={(e) => {
                    if (e.target.value !== (o.tracking_number ?? '')) onUpdate(o.id, { tracking_number: e.target.value });
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProductsPanel({
  products,
  onToggleActive,
  onCreated,
}: {
  products: Product[];
  onToggleActive: (id: string, active: boolean) => void;
  onCreated: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  return (
    <div>
      <button className="btn-primary" style={{ marginBottom: '1.5rem' }} onClick={() => setShowForm((s) => !s)}>
        {showForm ? 'Cancel' : '+ Add product'}
      </button>
      {showForm && (
        <NewProductForm
          onDone={() => {
            setShowForm(false);
            onCreated();
          }}
        />
      )}
      <div style={{ display: 'grid', gap: '1rem' }}>
        {products.map((p) => (
          <div key={p.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.75rem', border: '1px solid var(--line)' }}>
            {p.product_images?.[0]?.url && <img src={p.product_images[0].url} alt={p.name} style={{ width: 56, height: 74, objectFit: 'cover' }} />}
            <div style={{ flex: 1 }}>
              <strong>{p.name}</strong> — {formatPrice(p.price_cents)}
              <div style={{ fontSize: '0.8rem', color: 'var(--fg-soft)' }}>{p.active ? 'Live on storefront' : 'Hidden'}</div>
            </div>
            <button className="btn-ghost" onClick={() => onToggleActive(p.id, !p.active)}>
              {p.active ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function NewProductForm({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [swatch1, setSwatch1] = useState('#15120F');
  const [swatch2, setSwatch2] = useState('#EDE7DA');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError('Add a product photo');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error ?? 'Image upload failed');

      const createRes = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name,
          price_cents: Math.round(parseFloat(price) * 100),
          description,
          swatch_hex_1: swatch1,
          swatch_hex_2: swatch2,
          images: [
            { url: uploadData.url, role: 'hero' },
            { url: uploadData.url, role: 'card' },
          ],
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error ?? 'Could not create product');
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <label>
        Name
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label>
        Price (USD)
        <input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required />
      </label>
      <label>
        Description
        <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <label style={{ flex: 1 }}>
          Swatch 1
          <input type="color" value={swatch1} onChange={(e) => setSwatch1(e.target.value)} />
        </label>
        <label style={{ flex: 1 }}>
          Swatch 2
          <input type="color" value={swatch2} onChange={(e) => setSwatch2(e.target.value)} />
        </label>
      </div>
      <label>
        Photo
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} required />
      </label>
      {error && <div className="cart-error">{error}</div>}
      <button className="btn-primary" type="submit" disabled={busy}>
        {busy ? 'Adding…' : 'Add product'}
      </button>
    </form>
  );
}
