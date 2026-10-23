import type { Metadata } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AuthGuard } from '@/components/AuthGuard';
import { InitialPageLoader } from '@/components/InitialPageLoader';

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
  metadataBase: new URL('https://onewishes.com'),
  applicationName: 'OneWishes',
  title: 'OneWishes — A wish worth sending',
  description: 'OneWishes limits how many people you can wish, on purpose — so the ones you do wish know exactly what it cost you.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'OneWishes — A wish worth sending',
    description: 'Artificial Scarcity Wish Platform. Send rare, everlasting wishes.',
    url: 'https://onewishes.com',
    siteName: 'OneWishes',
    type: 'website',
  },
};

const siteNameSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'OneWishes',
  alternateName: ['onewishes', 'One Wishes'],
  url: 'https://onewishes.com/',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="48x48" href="/icon-48.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/icon-96.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteNameSchema) }}
        />
      </head>
      <body className="bg-[#141f1b] text-[#f3eee3] flex flex-col min-h-screen selection:bg-[#72897e] selection:text-white">
        <InitialPageLoader />
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
