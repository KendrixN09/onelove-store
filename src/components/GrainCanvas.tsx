'use client';

import { useEffect, useRef } from 'react';

export function GrainCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function paint() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
      const w = canvas!.width;
      const h = canvas!.height;
      const imgData = ctx!.createImageData(w, h);
      const buf = imgData.data;
      for (let i = 0; i < buf.length; i += 4) {
        const v = 128 + (Math.random() - 0.5) * 90;
        buf[i] = v;
        buf[i + 1] = v;
        buf[i + 2] = v;
        buf[i + 3] = 255;
      }
      ctx!.putImageData(imgData, 0, 0);
    }
    paint();
    window.addEventListener('resize', paint);
    return () => window.removeEventListener('resize', paint);
  }, []);

  return <canvas id="grain" ref={ref} />;
}
