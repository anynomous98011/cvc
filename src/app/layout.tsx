import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { AppHeader } from '@/components/app-header';
import { ThemeToggle } from '@/components/theme-toggle';
import { Toaster } from '@/components/ui/toaster';
import { SessionProvider } from '@/components/session-provider';
import { ActivityTracker } from '@/components/activity-tracker';
import { PwaRegister } from '@/components/pwa-register';

const fontInter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const fontSpaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: {
    default: 'Rachna Rivo | AI-Powered Social Media Creator Studio',
    template: '%s | Rachna Rivo',
  },
  description: 'Rachna Rivo is a comprehensive AI-powered toolkit for content creators to analyze SEO, discover viral trends, and generate engaging social media content.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Rachna Rivo',
  },
  formatDetection: {
    telephone: false,
  },
  keywords: [
    'content creation',
    'AI writer',
    'SEO analyzer',
    'viral trends',
    'social media tool',
    'Rachna Rivo',
    'creator studio',
    'AI assistant'
  ],
  authors: [{ name: 'Rachna Rivo Team' }],
  creator: 'Rachna Rivo',
  metadataBase: new URL('https://cvc-amber.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://cvc-amber.vercel.app',
    title: 'Rachna Rivo | AI-Powered Social Media Creator Studio',
    description: 'Optimize and create viral social media content with AI. Discover trends, analyze SEO, and automate content writing.',
    siteName: 'Rachna Rivo',
    images: [
      {
        url: '/image.png',
        width: 1200,
        height: 630,
        alt: 'Rachna Rivo AI Creator Studio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rachna Rivo | AI-Powered Social Media Creator Studio',
    description: 'Optimize and create viral social media content with AI.',
    images: ['/image.png'],
    creator: '@rachnarivo',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Rachna Rivo',
  url: 'https://cvc-amber.vercel.app',
};

const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Rachna Rivo',
  operatingSystem: 'All',
  applicationCategory: 'BusinessApplication',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  description: 'AI-powered toolkit for social media content creators to discover trends, analyze SEO, and generate viral content.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
        />
        {/* PWA – Apple / iOS */}
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Rachna Rivo" />
        {/* Viewport fill for iOS notch */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        {/* PWA – Windows / Edge */}
        <meta name="msapplication-TileColor" content="#ec4899" />
        <meta name="msapplication-TileImage" content="/icon-192x192.png" />
        <meta name="theme-color" content="#ec4899" />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontInter.variable,
          fontSpaceGrotesk.variable
        )}
      >
        <SessionProvider>
          <PwaRegister />
          <ActivityTracker />
            <ThemeProvider
              attribute="class"
              defaultTheme="theme-neon-pink"
              enableSystem
              disableTransitionOnChange
            >
              <div className="relative flex min-h-screen flex-col">
                <AppHeader />
                <main className="flex-1">{children}</main>
                <div className="fixed bottom-4 left-4 z-50">
                  <ThemeToggle />
                </div>
              </div>
              <Toaster />
            </ThemeProvider>
          </SessionProvider>
      </body>
    </html>
  );
}
