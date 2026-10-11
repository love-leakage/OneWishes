import type { Metadata } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AuthGuard } from '@/components/AuthGuard';

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
      <body className="bg-[#141f1b] text-[#f3eee3] flex flex-col min-h-screen selection:bg-[#72897e] selection:text-white">
        <AuthGuard>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </AuthGuard>
      </body>
    </html>
  );
}
