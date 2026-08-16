'use client';

import { useState } from 'react';
import { useCart } from './CartProvider';

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, setQty, subtotalCents } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setError(null);
    setCheckingOut(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ items: items.map((i) => ({ productId: i.productId, qty: i.qty })) }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Checkout failed');
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong starting checkout');
      setCheckingOut(false);
    }
  }

  return (
    <>
      <div className={`cart-overlay${isOpen ? ' open' : ''}`} onClick={closeCart} />
      <aside className={`cart-drawer${isOpen ? ' open' : ''}`} aria-hidden={!isOpen}>
        <div className="cart-head">
          <h3>Your bag</h3>
          <button className="cart-close" onClick={closeCart} aria-label="Close cart">
            ✕
          </button>
        </div>
        <div className="cart-items">
          {items.length === 0 && <p className="cart-empty">Your bag is empty.</p>}
          {items.map((item) => (
            <div className="cart-line" key={item.productId}>
              {item.image && <img src={item.image} alt={item.name} />}
              <div className="cart-line-info">
                <h4>{item.name}</h4>
                <span>{formatPrice(item.priceCents)}</span>
                <div className="cart-qty">
                  <button onClick={() => setQty(item.productId, item.qty - 1)} aria-label="Decrease quantity">
                    −
                  </button>
                  <span>{item.qty}</span>
                  <button onClick={() => setQty(item.productId, item.qty + 1)} aria-label="Increase quantity">
                    +
                  </button>
                </div>
                <button className="cart-remove" onClick={() => removeItem(item.productId)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="cart-foot">
          {error && <div className="cart-error">{error}</div>}
          <div className="cart-subtotal">
            <span>Subtotal</span>
            <span>{formatPrice(subtotalCents)}</span>
          </div>
          <button
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={items.length === 0 || checkingOut}
            onClick={handleCheckout}
          >
            {checkingOut ? 'Redirecting to checkout…' : 'Checkout →'}
          </button>
        </div>
      </aside>
    </>
  );
}
