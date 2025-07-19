
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Languages, Menu, Users } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import React from 'react';
import { usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export function Header() {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();
  const isTelugu = pathname.startsWith('/te');

  const navLinks = isTelugu ? [
    { href: '/te#benefits', label: 'ప్రయోజనాలు' },
    { href: '/te#pricing', label: 'ధర' },
    { href: '/te#testimonials', label: 'టెస్టిమోనియల్స్' },
    { href: '/te/dashboard', label: 'డాష్‌బోర్డ్' },
  ] : [
    { href: '/#benefits', label: 'Benefits' },
    { href: '/#pricing', label: 'Pricing' },
    { href: '/#testimonials', label: 'Testimonials' },
    { href: '/dashboard', label: 'Dashboard' },
  ];
  
  const loginLink = isTelugu ? '/te/login' : '/login';
  const signupLink = isTelugu ? '/te/signup' : '/signup';
  const loginText = isTelugu ? 'లాగిన్' : 'Login';
  const joinNowText = isTelugu ? 'ఇప్పుడే చేరండి' : 'Join Now';
  const homeLink = isTelugu ? '/te' : '/';

  const otherLang = isTelugu ? 'en' : 'te';
  const newPath = isTelugu ? pathname.replace('/te', '') || '/' : `/te${pathname}`;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-auto flex items-center">
          <Link href={homeLink} className="flex items-center gap-2 font-bold text-lg font-headline">
            <Users className="h-6 w-6 text-primary" />
            Sanghika Samakhya
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => (
             <Link key={link.href} href={link.href} className="transition-colors hover:text-primary">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Languages className="h-5 w-5" />
                <span className="sr-only">Toggle Language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={isTelugu ? pathname.replace('/te', '') || '/' : pathname} locale="en">English</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={isTelugu ? pathname : `/te${pathname}`} locale="te">తెలుగు</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button asChild variant="outline" className="hidden md:flex">
            <Link href={loginLink}>{loginText}</Link>
          </Button>
          <Button asChild className="hidden md:flex bg-accent text-accent-foreground hover:bg-accent/90">
             <Link href={signupLink}>{joinNowText}</Link>
          </Button>

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
                  <Link href={homeLink} className="flex items-center gap-2 font-bold text-lg font-headline" onClick={() => setIsOpen(false)}>
                    <Users className="h-6 w-6 text-primary" />
                    Sanghika Samakhya
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <div className="mt-8 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="text-lg font-medium transition-colors hover:text-primary" onClick={() => setIsOpen(false)}>
                    {link.label}
                  </Link>
                ))}
                <div className="mt-6 flex flex-col gap-3">
                   <Button asChild variant="outline" size="lg">
                      <Link href={loginLink} onClick={() => setIsOpen(false)}>{loginText}</Link>
                    </Button>
                    <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                      <Link href={signupLink} onClick={() => setIsOpen(false)}>{joinNowText}</Link>
                    </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
