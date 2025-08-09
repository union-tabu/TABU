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

function LanguageToggle({ onLanguageChange, inSheet = false }: { onLanguageChange: (lang: 'en' | 'te') => void, inSheet?: boolean }) {

  if (inSheet) {
    return (
      <>
        <h3 className="text-lg font-medium text-gray-700">Language</h3>
        <Button
          variant="ghost"
          size="lg"
          className="w-full justify-start text-gray-700"
          onClick={() => onLanguageChange('en')}
        >
          English
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="w-full justify-start text-gray-700"
          onClick={() => onLanguageChange('te')}
        >
          తెలుగు (Telugu)
        </Button>
      </>
    )
  }

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
        <DropdownMenuItem onSelect={() => onLanguageChange('en')}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onLanguageChange('te')}>
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
  const lang = pathname.startsWith('/te') ? 'te' : 'en';

  const navLinks = lang === 'te' ? [
    { href: '/te', label: 'హోమ్' },
    { href: '/te#benefits', label: 'ప్రయోజనాలు' },
    { href: '/te#about', label: 'మా గురించి' },
  ] : [
    { href: '/en', label: 'Home' },
    { href: '/en#benefits', label: 'Benefits' },
    { href: '/en#about', label: 'About' },
  ];
  
  const signinLink = `/${lang}/signin`;
  const signupLink = `/${lang}/signup`;
  const dashboardLink = `/${lang}/dashboard`;
  const signinText = lang === 'te' ? 'సైన్ ఇన్' : 'Sign In';
  const registerText = lang === 'te' ? 'నమోదు చేసుకోండి' : 'Register';
  const dashboardText = lang === 'te' ? 'డాష్‌బోర్డ్' : 'Dashboard';
  const homeLink = `/${lang}`;
  
  const handleLanguageChange = (newLang: 'en' | 'te') => {
    if (newLang === lang) {
      setIsOpen(false);
      return;
    }
    
    // Remove the current language prefix to get the base path
    const basePath = pathname.startsWith(`/${lang}`) ? pathname.substring(`/${lang}`.length) : pathname;
    
    // Construct the new path with the new language prefix
    const newPath = `/${newLang}${basePath || '/'}`;
    
    router.push(newPath);
    setIsOpen(false);
  };

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
             <LanguageToggle onLanguageChange={handleLanguageChange} />
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
                   <LanguageToggle onLanguageChange={handleLanguageChange} inSheet={true} />
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
