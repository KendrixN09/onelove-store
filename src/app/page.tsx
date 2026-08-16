import { getActiveProducts, imageForRole, formatPrice } from '@/lib/products';
import { HeroStage } from '@/components/HeroStage';
import { ProductCard } from '@/components/ProductCard';
import { Reveal } from '@/components/Reveal';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const products = await getActiveProducts();
  const heroProducts = products.slice(0, 2);

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow label">
            {products.length} piece{products.length === 1 ? '' : 's'} · Capsule 01
          </div>
          <h1 className="display glitch-in">
            One Love Co.
            <span className="cap1">New Drops Regularly</span>
          </h1>
          <p className="lede">Vegan leather colorblock panels over heavyweight jersey. This capsule is just the start — more pieces drop soon.</p>
          <div className="hero-actions">
            <a className="btn-primary" href="#drop">
              Shop the drop →
            </a>
            <a className="btn-ghost" href="#construction">
              See the construction
            </a>
          </div>
        </div>
        {heroProducts.length >= 2 ? (
          <HeroStage
            imageOne={imageForRole(heroProducts[0], 'hero')}
            altOne={heroProducts[0].name}
            tagOne={heroProducts[0].name}
            imageTwo={imageForRole(heroProducts[1], 'hero')}
            altTwo={heroProducts[1].name}
            tagTwo={heroProducts[1].name}
          />
        ) : null}
      </section>

      <section className="shell" id="drop">
        <div className="section-head">
          <div>
            <div className="label">The Drop</div>
            <h2 className="display">Shop the collection.</h2>
          </div>
          <div className="counter">{products.length} available</div>
        </div>

        <div className="drop-grid">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              productId={p.id}
              name={p.name}
              priceCents={p.price_cents}
              priceLabel={formatPrice(p.price_cents)}
              image={imageForRole(p, 'card')}
              swatch1={p.swatch_hex_1}
              swatch2={p.swatch_hex_2}
              colorwayLabel="Striped colorway"
            />
          ))}
          {products.length === 0 && <p style={{ color: 'var(--fg-soft)' }}>New pieces coming soon.</p>}
        </div>
      </section>

      <Reveal as="section" className="shell lookbook" >
        <div id="lookbook">
          <div className="section-head">
            <div>
              <div className="label">Lookbook</div>
              <h2 className="display">From the shoot.</h2>
            </div>
            <div className="counter">Capsule 01</div>
          </div>
          <div className="lookbook-grid">
            <figure className="lookbook-frame lb-tall">
              <img src="/images/lookbook1.jpg" alt="Both models standing together" />
            </figure>
            <figure className="lookbook-frame">
              <img src="/images/lookbook2.jpg" alt="Both models standing back to back in profile" />
            </figure>
            <figure className="lookbook-frame">
              <img src="/images/lookbook3.jpg" alt="Both models facing forward, close crop" />
            </figure>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="spec-strip">
        <div className="spec-visual" id="construction">
          <img src="/images/construction.jpg" alt="Close-up of the embroidered One Love wordmark" />
        </div>
        <div className="spec-copy">
          <div className="label">Construction</div>
          <h2 className="display">
            Not a print.
            <br />
            Actual panels.
          </h2>
          <dl className="spec-list">
            <div>
              <dt>Shell</dt>
              <dd>Vegan leather colorblock panels, seamed at the yoke, chest, and hem — not a printed pattern.</dd>
            </div>
            <div>
              <dt>Fit</dt>
              <dd>Oversized, dropped shoulder, boxy through the body. Sits heavy on purpose.</dd>
            </div>
          </dl>
        </div>
      </Reveal>

      <Reveal as="section" className="pull">
        <blockquote>&ldquo;One love. Every stitch, every panel, one word over the heart.&rdquo;</blockquote>
        <cite>— Onelove.co</cite>
      </Reveal>

      <footer>
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="brand" style={{ marginBottom: '1rem' }}>
              <img src="/images/logo.png" alt="One Love badge" style={{ width: 28, height: 28 }} />
              <span>One Love</span>
            </div>
            <p>Small-batch leather colorblock streetwear. New drops added regularly.</p>
          </div>
          <div>
            <h4>Shop</h4>
            <ul>
              <li>
                <a href="#drop">Current drop</a>
              </li>
            </ul>
          </div>
          <div>
            <h4>Info</h4>
            <ul>
              <li>
                <a href="mailto:hello@onelove.co">Contact</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Onelove.co</span>
          <span>New capsules drop regularly</span>
        </div>
      </footer>
    </>
  );
}
