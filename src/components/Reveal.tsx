'use client';

import { useEffect, useRef, useState } from 'react';

export function Reveal({ as: Tag = 'div', className = '', children }: { as?: keyof JSX.IntrinsicElements; className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
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
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    // @ts-expect-error - ref type varies by the dynamic tag
    <Tag ref={ref} className={`reveal${inView ? ' in-view' : ''} ${className}`}>
      {children}
    </Tag>
  );
}
