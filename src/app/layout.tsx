import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { AppHeader } from '@/components/app-header';
import { Toaster } from '@/components/ui/toaster';

const fontInter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const fontSpaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: 'CVC - Create Viral Content',
  description: 'AI-powered toolkit for social media content creators',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontInter.variable,
          fontSpaceGrotesk.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
            <div className="relative flex min-h-screen flex-col">
              <AppHeader />
              <main className="flex-1">{children}</main>
            </div>
            <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
