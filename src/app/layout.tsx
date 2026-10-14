import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'DineDesk | Artisanal Dining, Digital Menu & Table Reservations',
  description:
    'Experience extraordinary dining at DineDesk. Explore our artisanal menu, order online with live tracking, and reserve your tables seamlessly.',
  keywords: ['restaurant', 'dining', 'table reservation', 'food ordering', 'bistro', 'bengaluru'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col bg-[#fbfaf8] text-stone-900 selection:bg-orange-600 selection:text-white">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
