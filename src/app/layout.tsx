import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { Onest } from 'next/font/google';
import './globals.css';
import { ToasterProvider } from './providers/toaster';
import { BRAND } from '@/lib/brand';

const onest = Onest({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL?.trim() || BRAND.domain),
  title: {
    default:
      'AsiaBD Commerce AI - AI Listings & Content for E-commerce Sellers',
    template: '%s | AsiaBD Commerce AI',
  },
  description: BRAND.description,
  openGraph: {
    title: 'AsiaBD Commerce AI - AI Listings & Content for E-commerce Sellers',
    description: BRAND.description,
    url: '/',
    siteName: BRAND.name,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AsiaBD Commerce AI',
    description: BRAND.tagline,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`bg-gray-50 dark:bg-dark-secondary min-h-screen flex flex-col ${onest.className}`}
      >
        <ThemeProvider disableTransitionOnChange>
          {/* ToasterProvider must render before the children components */}
          {/* https://github.com/emilkowalski/sonner/issues/168#issuecomment-1773734618 */}
          <ToasterProvider />

          <div className="isolate flex flex-col flex-1">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
