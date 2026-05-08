import type { Metadata } from 'next';
import { Syne, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'IMGFLOW — Pro Image Pipeline',
  description: 'Browser-native image optimization pipeline. Upscale, remove backgrounds, smart crop & reframe — 100% local, zero API, blazing fast.',
  keywords: ['image optimization', 'shopify images', 'background removal', 'smart crop', 'webp converter', 'image pipeline'],
  authors: [{ name: 'IMGFLOW' }],
  creator: 'IMGFLOW',
  openGraph: {
    title: 'IMGFLOW — Pro Image Pipeline',
    description: 'Browser-native image optimization. 100% local · Zero API · Blazing fast.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title: 'IMGFLOW — Pro Image Pipeline',
    description: 'Browser-native image optimization. 100% local · Zero API · Blazing fast.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${jetbrainsMono.variable}`}>
      <body>
        <div className="noise" />
        <div className="grid-bg" />
        {children}
      </body>
    </html>
  );
}
