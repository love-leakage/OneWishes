import type { Metadata } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ONEWISHES — A wish worth sending',
  description: 'OneWishes limits how many people you can wish, on purpose — so the ones you do wish know exactly what it cost you.',
  icons: {
    icon: '/icon.svg',
  },
  openGraph: {
    title: 'ONEWISHES — A wish worth sending',
    description: 'Artificial Scarcity Wish Platform. Send rare, everlasting wishes.',
    url: 'https://onewishes.com',
    siteName: 'OneWishes',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="bg-[#020617] text-white flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
