
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, Languages } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import Image from 'next/image';


function LanguageToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const isTelugu = pathname.startsWith('/te');


  const handleLanguageChange = (lang: 'en' | 'te') => {
    let newPath;

    if (lang === 'en' && isTelugu) {
      newPath = pathname === '/te' ? '/' : pathname.substring(3);
    } else if (lang === 'te' && !isTelugu) {
      newPath = pathname === '/' ? '/te' : `/te${pathname}`;
    } else {
      return; // Already on the correct language version
    }
    router.push(newPath);
  };

  return (
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Languages className="h-5 w-5" />
                <span className="sr-only">Change language</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Language</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => handleLanguageChange('en')}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleLanguageChange('te')}>
          తెలుగు (Telugu)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Header() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isTelugu = pathname.startsWith('/te');

  const navLinks = isTelugu ? [
    { href: '/te', label: 'హోమ్' },
    { href: '/te#benefits', label: 'ప్రయోజనాలు' },
    { href: '/te#about', label: 'మా గురించి' },
  ] : [
    { href: '/', label: 'Home' },
    { href: '/#benefits', label: 'Benefits' },
    { href: '/#about', label: 'About' },
  ];
  
  const signinLink = isTelugu ? '/te/signin' : '/signin';
  const signupLink = isTelugu ? '/te/signup' : '/signup';
  const dashboardLink = isTelugu ? '/te/dashboard' : '/dashboard';
  const signinText = isTelugu ? 'సైన్ ఇన్' : 'Sign In';
  const registerText = isTelugu ? 'నమోదు చేసుకోండి' : 'Register';
  const dashboardText = isTelugu ? 'డాష్‌బోర్డ్' : 'Dashboard';
  const homeLink = isTelugu ? '/te' : '/';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href={homeLink} className="flex items-center gap-2">
            <Image src="/tabu-logo-website.png" alt="TABU Logo" width={40} height={40} className="h-10 w-auto" />
            <span className="font-bold text-lg">TABU</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-2">
             <LanguageToggle />
            {isAuthenticated ? (
              <Button asChild>
                <Link href={dashboardLink}>{dashboardText}</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link href={signinLink}>{signinText}</Link>
                </Button>
                <Button asChild>
                  <Link href={signupLink}>{registerText}</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-gray-700 hover:bg-gray-900 hover:text-white">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>
                  <Link 
                    href={homeLink} 
                    className="flex items-center gap-2" 
                    onClick={() => setIsOpen(false)}
                  >
                    <Image src="/tabu-logo-website.png" alt="TABU Logo" width={40} height={40} className="h-10 w-auto" />
                    <span className="font-bold text-lg">TABU</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <div className="mt-8 flex flex-col space-y-6">
                {navLinks.map((link) => (
                  <Link 
                    key={link.href} 
                    href={link.href} 
                    className="text-lg font-medium text-gray-700 hover:text-gray-900 transition-colors" 
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                 <div className="pt-6 border-t space-y-3">
                    <h3 className="text-lg font-medium text-gray-700">Language</h3>
                     <Button 
                        variant="ghost" 
                        size="lg" 
                        className="w-full justify-start text-gray-700" 
                        onClick={() => {
                            const newPath = isTelugu ? (pathname === '/te' ? '/' : pathname.substring(3)) : pathname;
                            router.push(newPath);
                            setIsOpen(false);
                        }}>
                        English
                    </Button>
                     <Button 
                        variant="ghost" 
                        size="lg" 
                        className="w-full justify-start text-gray-700"
                        onClick={() => {
                             const newPath = isTelugu ? pathname : (pathname === '/' ? '/te' : `/te${pathname}`);
                             router.push(newPath);
                             setIsOpen(false);
                        }}
                        >
                        తెలుగు (Telugu)
                    </Button>
                </div>
                <div className="pt-6 border-t space-y-3">
                  {isAuthenticated ? (
                    <Button asChild size="lg" className="w-full">
                      <Link href={dashboardLink} onClick={() => setIsOpen(false)}>
                        {dashboardText}
                      </Link>
                    </Button>
                  ) : (
                    <>
                      <Button asChild variant="ghost" size="lg" className="w-full text-gray-700 hover:text-white hover:bg-gray-900">
                        <Link href={signinLink} onClick={() => setIsOpen(false)}>
                          {signinText}
                        </Link>
                      </Button>
                      <Button asChild size="lg" className="w-full">
                        <Link href={signupLink} onClick={() => setIsOpen(false)}>
                          {registerText}
                        </Link>
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
