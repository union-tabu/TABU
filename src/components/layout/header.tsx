
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogOut, Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export function Header() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
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
  const logoutText = isTelugu ? 'లాగ్ అవుట్' : 'Logout';
  const homeLink = isTelugu ? '/te' : '/';

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('isAuthenticated');
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.push(homeLink);
      if (isOpen) setIsOpen(false);
    } catch (error) {
      console.error("Logout Error:", error);
      toast({
        title: "Error",
        description: "Could not log you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href={homeLink} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-300 rounded"></div>
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
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <Button asChild className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium">
                  <Link href={dashboardLink}>{dashboardText}</Link>
                </Button>
                <Button variant="ghost" onClick={handleLogout} className="text-gray-700 hover:text-gray-900 px-4 py-2 text-sm font-medium">
                  <LogOut className="mr-2 h-4 w-4" />
                  {logoutText}
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" className="text-gray-700 px-4 py-2 text-sm font-medium">
                  <Link href={loginLink}>{loginText}</Link>
                </Button>
                <Button asChild className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium">
                  <Link href={signupLink}>{registerText}</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-gray-700 hover:text-gray-900">
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
                    <div className="w-8 h-8 bg-gray-300 rounded"></div>
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
                  {isAuthenticated ? (
                    <>
                      <Button asChild size="lg" className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                        <Link href={dashboardLink} onClick={() => setIsOpen(false)}>
                          {dashboardText}
                        </Link>
                      </Button>
                       <Button variant="ghost" size="lg" onClick={handleLogout} className="w-full text-gray-700 hover:text-gray-900">
                         <LogOut className="mr-2 h-5 w-5" />
                         {logoutText}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button asChild variant="ghost" size="lg" className="w-full text-gray-700 hover:text-gray-900">
                        <Link href={loginLink} onClick={() => setIsOpen(false)}>
                          {loginText}
                        </Link>
                      </Button>
                      <Button asChild size="lg" className="w-full bg-gray-900 hover:bg-gray-800 text-white">
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
