export default function SuccessPage() {
  return (
    <div className="shell" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div>
        <div className="label" style={{ color: 'var(--accent)' }}>
          Order confirmed
        </div>
        <h1 className="display" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', margin: '0.5rem 0 1.2rem' }}>
          One Love.
        </h1>
        <p style={{ color: 'var(--fg-soft)', maxWidth: '40ch', margin: '0 auto 2rem' }}>
          Thank you — your order is confirmed and a receipt is on its way to your inbox. We&rsquo;ll email tracking details once it ships.
        </p>
        <a className="btn-primary" href="/">
          Back to the shop →
        </a>
      </div>
    </div>
  );
}
