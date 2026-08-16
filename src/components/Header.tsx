'use client';

import { useCart } from './CartProvider';

export function Header() {
  const { openCart, count } = useCart();

  return (
    <header>
      <a className="brand" href="/">
        <img src="/images/logo.png" alt="One Love badge" />
        <span>One Love</span>
      </a>
      <nav className="links">
        <a href="#drop">The Drop</a>
        <a href="#lookbook">Lookbook</a>
        <a href="#construction">Construction</a>
      </nav>
      <button className="cart-btn" onClick={openCart}>
        Bag
        {count > 0 && <span className="cart-count">{count}</span>}
      </button>
    </header>
  );
}
