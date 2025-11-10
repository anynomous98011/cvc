"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { ThemeToggle } from '@/components/theme-toggle';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Menu } from 'lucide-react';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Create', href: '/creator-studio' },
  { label: 'SEO', href: '/seo-analyzer'},
  { label: 'Trending', href: '/trending' },
  { label: 'Viral Trends', href: '/viral-trends' },
];

export function AppHeader() {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setIsSheetOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Icons.logo className="h-8 w-8" />
          <span className="font-headline text-2xl font-bold">CVC</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 text-sm md:flex">
            {navItems.map((item) => (
                <Link
                key={item.href}
                href={item.href}
                className={cn(
                    'transition-all duration-200 hover:text-foreground/80 hover:scale-105',
                    pathname === item.href
                    ? 'text-foreground font-semibold'
                    : 'text-foreground/60'
                )}
                >
                {item.label}
                </Link>
            ))}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-2">
          {/* Mobile Nav */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <Link href="/" className="mr-6 flex items-center space-x-2 mb-8">
                    <Icons.logo className="h-8 w-8" />
                    <span className="font-headline text-2xl font-bold">CVC</span>
                </Link>
                <nav className="flex flex-col gap-6 text-lg font-medium">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'transition-all duration-200 hover:text-foreground/80 hover:scale-105',
                                pathname === item.href
                                ? 'text-foreground'
                                : 'text-foreground/60'
                            )}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            {isMounted ? <ThemeToggle /> : <div className="h-10 w-10" />}
          </div>
        </div>
      </div>
    </header>
  );
}
