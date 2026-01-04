"use client"
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Menu, LogOut } from 'lucide-react';
import Image from 'next/image';
import { ThemeToggle } from './theme-toggle';
import { User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Create', href: '/creator-studio' },
  { label: 'AI Assistant', href: '/ai-assistant' },
  { label: 'Trending', href: '/trending' },
  { label: 'Viral Trends', href: '/viral-trends' },
];

interface User {
  id: string;
  email: string;
  name: string | null;
}

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();

        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    setIsSheetOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/me', {
        method: 'POST',
      });
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <Image
            src="/image.png"
            alt="Logo"
            width={32}
            height={32}
            className="transition-all duration-300 group-hover:rotate-[15deg] group-hover:scale-110"
          />
          <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500 group-hover:opacity-90 transition-opacity">
            Rachna
          </span>
        </Link>

        {/* Desktop Nav */}
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
                    <Image
                      src="/image.png"
                      alt="Logo"
                      width={32}
                      height={32}
                    />
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
                </nav>
                {!loading && !user && (
                  <div className="flex flex-col gap-2 mt-8 pt-8 border-t">
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link href="/signup">Sign Up</Link>
                    </Button>
                  </div>
                )}
                {!loading && user && (
                  <div className="flex flex-col gap-2 mt-8 pt-8 border-t">
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/profile">Profile</Link>
                    </Button>
                    <Button variant="destructive" className="w-full" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                )}
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            {isMounted ? <ThemeToggle /> : <div className="h-10 w-10" />}

            {!loading && !user && (
              <div className="hidden md:flex gap-2 ml-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            )}

            {!loading && user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-2 hidden md:flex">
                    <User className="h-5 w-5" />
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {user.name || user.email}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
