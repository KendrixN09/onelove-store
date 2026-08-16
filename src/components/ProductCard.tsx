'use client';

import { useEffect, useRef, useState } from 'react';
import { useCart } from './CartProvider';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

export function ProductCard({
  productId,
  name,
  priceCents,
  priceLabel,
  image,
  swatch1,
  swatch2,
  colorwayLabel,
}: {
  productId: string;
  name: string;
  priceCents: number;
  priceLabel: string;
  image: string;
  swatch1: string;
  swatch2: string;
  colorwayLabel: string;
}) {
  const { addItem } = useCart();
  const cardRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [added, setAdded] = useState(false);
  const [size, setSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(card);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    const frame = frameRef.current;
    if (!card || !frame) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    function onMove(e: MouseEvent) {
      const r = card!.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      frame!.style.transform = `rotateY(${px * 10}deg) rotateX(${-py * 10}deg) translateZ(10px)`;
    }
    function onLeave() {
      frame!.style.transform = 'rotateY(0deg) rotateX(0deg) translateZ(0px)';
    }
    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);
    return () => {
      card.removeEventListener('mousemove', onMove);
      card.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  function handleAdd() {
    if (!size) {
      setSizeError(true);
      return;
    }
    addItem({ productId, size, name, priceCents, image });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <article className={`product-card${inView ? ' in-view' : ''}`} ref={cardRef}>
      <div className="card-frame" ref={frameRef}>
        <div className="card-photo">
          <img src={image} alt={name} />
          <div className="card-shine" />
        </div>
      </div>
      <div className="card-meta">
        <div>
          <h3>{name}</h3>
          <div className="swatches">
            <span className="swatch" style={{ background: swatch1 }} />
            <span className="swatch" style={{ background: swatch2 }} />
          </div>
        </div>
        <div className="card-price">{priceLabel}</div>
      </div>
      <div className="size-picker" role="group" aria-label="Select a size">
        {SIZES.map((s) => (
          <button
            key={s}
            type="button"
            className={`size-btn${size === s ? ' selected' : ''}`}
            onClick={() => {
              setSize(s);
              setSizeError(false);
            }}
          >
            {s}
          </button>
        ))}
      </div>
      {sizeError && <span className="size-error">Pick a size first</span>}
      <div className="card-cta">
        <button onClick={handleAdd}>{added ? 'Added ✓' : 'Add to bag →'}</button>
        <span className="stock-note">{colorwayLabel}</span>
      </div>
    </article>
  );
}
