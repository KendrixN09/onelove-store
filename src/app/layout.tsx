import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/components/CartProvider';
import { CartDrawer } from '@/components/CartDrawer';
import { Header } from '@/components/Header';
import { GrainCanvas } from '@/components/GrainCanvas';

export const metadata: Metadata = {
  title: 'One Love Co.',
  description: 'Vegan leather colorblock streetwear. New drops regularly.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <GrainCanvas />
          <Header />
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
