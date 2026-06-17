"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Menu, LogOut, ShieldAlert, LogIn } from 'lucide-react';
import Image from 'next/image';
import { ThemeToggle } from './theme-toggle';
import { useSession } from '@/components/session-provider';
import { useRouter } from 'next/navigation';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Create', href: '/creator-studio' },
  { label: 'AI Assistant', href: '/ai-assistant' },
  { label: 'Trending', href: '/trending' },
  { label: 'Viral Trends', href: '/viral-trends' },
];

export function AppHeader() {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { user, refreshSession } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    await refreshSession();
    router.push('/login');
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setIsSheetOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="bg-white rounded-lg p-1 flex items-center justify-center w-8 h-8 shadow-sm border border-zinc-200">
            <img
              src="/image.png"
              alt="Logo"
              className="w-full h-full object-contain transition-all duration-300 group-hover:rotate-[15deg] group-hover:scale-110"
            />
          </div>
          <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500 group-hover:opacity-90 transition-opacity">
            Rachna
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium md:flex ml-12">
            {navItems.map((item) => (
                <Link
                key={item.href}
                href={item.href}
                className={cn(
                    'transition-all relative pb-1 group',
                    pathname === item.href
                    ? 'text-foreground font-semibold'
                    : 'text-foreground/70 hover:text-foreground'
                )}
                >
                {item.label}
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>
            ))}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-2">
          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-2 mr-2">
            {user ? (
              <>
                {user.role === 'ADMIN' && (
                  <Button variant="ghost" size="sm" asChild className="gap-2 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10">
                    <Link href="/admin">
                      <ShieldAlert className="h-4 w-4" />
                      Admin
                    </Link>
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Log out
                </Button>
              </>
            ) : (
              <Button variant="default" size="sm" asChild className="gap-2">
                <Link href="/login">
                  <LogIn className="h-4 w-4" />
                  Log in
                </Link>
              </Button>
            )}
          </div>
          {/* Mobile Nav */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <Link href="/" className="flex items-center mb-8">
                  <div className="bg-white rounded-lg p-1 flex items-center justify-center w-8 h-8 shadow-sm border border-zinc-200">
                    <img
                      src="/image.png"
                      alt="Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </Link>
                <nav className="flex flex-col gap-6 text-lg font-medium">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'transition-colors hover:text-foreground/80',
                                pathname === item.href
                                ? 'text-foreground'
                                : 'text-foreground/60'
                            )}
                        >
                            {item.label}
                        </Link>
                    ))}
                    <div className="h-px bg-border my-2" />
                    {user ? (
                      <>
                        {user.role === 'ADMIN' && (
                          <Link href="/admin" className="transition-colors text-rose-500 hover:text-rose-400 flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5" />
                            Admin Panel
                          </Link>
                        )}
                        <button onClick={handleLogout} className="transition-colors text-foreground/60 hover:text-foreground text-left flex items-center gap-2">
                          <LogOut className="h-5 w-5" />
                          Log out
                        </button>
                      </>
                    ) : (
                      <Link href="/login" className="transition-colors text-foreground/60 hover:text-foreground flex items-center gap-2">
                        <LogIn className="h-5 w-5" />
                        Log in
                      </Link>
                    )}
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
