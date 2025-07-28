
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

export function Header() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const isTelugu = pathname.startsWith('/te');

  const navLinks = isTelugu ? [
    { href: '/te', label: 'హోమ్' },
    { href: '/te#about', label: 'మా గురించి' },
    { href: '/te#benefits', label: 'ప్రయోజనాలు' },
  ] : [
    { href: '/', label: 'Home' },
    { href: '/#about', label: 'About' },
    { href: '/#benefits', label: 'Benefits' },
  ];
  
  const loginLink = isTelugu ? '/te/login' : '/login';
  const signupLink = isTelugu ? '/te/signup' : '/signup';
  const dashboardLink = isTelugu ? '/te/dashboard' : '/dashboard';
  const loginText = isTelugu ? 'సైన్ ఇన్' : 'Sign In';
  const registerText = isTelugu ? 'నమోదు చేసుకోండి' : 'Register';
  const dashboardText = isTelugu ? 'డాష్‌బోర్డ్' : 'Dashboard';
  const homeLink = isTelugu ? '/te' : '/';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center">
        <div className="mr-auto flex items-center">
          <Link href={homeLink} className="flex items-center gap-2 font-bold text-lg">
            <div className="w-8 h-8 bg-gray-200 rounded-md"></div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navLinks.map((link) => (
             <Link key={link.href} href={link.href} className="transition-colors hover:text-primary/80">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          {isAuthenticated ? (
             <Button asChild>
                <Link href={dashboardLink}>{dashboardText}</Link>
             </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden md:flex">
                <Link href={loginLink}>{loginText}</Link>
              </Button>
              <Button asChild className="hidden md:flex">
                 <Link href={signupLink}>{registerText}</Link>
              </Button>
            </>
          )}

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>
                  <Link href={homeLink} className="flex items-center gap-2 font-bold text-lg" onClick={() => setIsOpen(false)}>
                     <div className="w-8 h-8 bg-gray-200 rounded-md"></div>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <div className="mt-8 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="text-lg font-medium transition-colors hover:text-primary/80" onClick={() => setIsOpen(false)}>
                    {link.label}
                  </Link>
                ))}
                <div className="mt-6 flex flex-col gap-3">
                    {isAuthenticated ? (
                         <Button asChild size="lg">
                            <Link href={dashboardLink} onClick={() => setIsOpen(false)}>{dashboardText}</Link>
                         </Button>
                    ) : (
                        <>
                            <Button asChild variant="ghost" size="lg">
                                <Link href={loginLink} onClick={() => setIsOpen(false)}>{loginText}</Link>
                            </Button>
                            <Button asChild size="lg">
                                <Link href={signupLink} onClick={() => setIsOpen(false)}>{registerText}</Link>
                            </Button>
                        </>
                    )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
