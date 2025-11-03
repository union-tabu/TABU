"use client";

import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/auth-context';
import { usePathname, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Languages, Menu, LogOut, User } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

function LanguageToggle({ inSheet = false }: { inSheet?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (lang: 'en' | 'te' | 'hi') => {
    const currentPath = pathname.split('/').slice(2).join('/');
    const newPath = `/${lang}/${currentPath}`;
    router.push(newPath);
  };
  
   if (inSheet) {
    return (
       <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-full justify-start text-lg font-medium text-muted-foreground">
            <Languages className="mr-2 h-5 w-5" />
            भाषा
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => handleLanguageChange('en')}>English</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleLanguageChange('te')}>తెలుగు (Telugu)</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleLanguageChange('hi')}>हिंदी (Hindi)</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
                <span className="sr-only">भाषा बदलें</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>भाषा</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => handleLanguageChange('en')}>English</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleLanguageChange('te')}>తెలుగు (Telugu)</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleLanguageChange('hi')}>हिंदी (Hindi)</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


export function DashboardHeaderHi() {
  const { userData, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/hi');
    toast({
      title: "आप लॉग आउट हो गए हैं।",
      description: "आप अपने खाते से सुरक्षित रूप से साइन आउट हो गए हैं।",
    });
  };

  const navItems = [
    { href: '/hi/dashboard', label: 'डैशबोर्ड' },
    { href: '/hi/payments', label: 'भुगतान' },
    { href: '/hi/union-members', label: 'यूनियन सदस्य' },
  ];
  
  const getInitials = (name: string | undefined) => {
    if (!name) return '';
    const nameParts = name.split(' ');
    const firstInitial = nameParts[0] ? nameParts[0][0] : '';
    const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1][0] : '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  }

  return (
    <header className="sticky top-0 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6 z-50">
       <Link
          href="/hi"
          className="flex items-center gap-2 text-lg font-semibold"
        >
          <Image src="/tabu-logo-website.png" alt="TABU Logo" width={40} height={40} className="h-10 w-auto" />
          <span className="font-bold">TABU</span>
        </Link>
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        {navItems.map((item) => (
             <Link
                key={item.href}
                href={item.href}
                className={`transition-colors hover:text-foreground ${pathname === item.href ? 'text-foreground' : 'text-muted-foreground'}`}
            >
                {item.label}
            </Link>
        ))}
      </nav>
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2">
            <LanguageToggle />
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                 <Avatar className="h-8 w-8">
                    <AvatarImage src={userData?.photoURL} alt={userData?.fullName} className="object-cover"/>
                    <AvatarFallback>{getInitials(userData?.fullName)}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                {loading ? 'लोड हो रहा है...' : userData?.fullName}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/hi/profile">प्रोफ़ाइल</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>लॉग आउट</DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 flex flex-col">
                 <SheetHeader>
                    <SheetTitle>
                        <Link 
                            href="/hi/dashboard" 
                            className="flex items-center gap-2" 
                            onClick={() => setIsSheetOpen(false)}
                        >
                            <Image src="/tabu-logo-website.png" alt="TABU Logo" width={40} height={40} className="h-10 w-auto" />
                            <span className="font-bold text-lg">TABU</span>
                        </Link>
                    </SheetTitle>
                </SheetHeader>
                <div className="mt-8 flex flex-col space-y-4 flex-grow">
                     <div className="border-b pb-4 flex items-center gap-3">
                         <Avatar className="h-10 w-10">
                            <AvatarImage src={userData?.photoURL} alt={userData?.fullName} className="object-cover"/>
                            <AvatarFallback>{getInitials(userData?.fullName)}</AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-medium text-muted-foreground">
                            {loading ? 'लोड हो रहा है...' : userData?.fullName}
                        </p>
                    </div>
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`text-lg font-medium transition-colors hover:text-foreground ${pathname === item.href ? 'text-foreground' : 'text-muted-foreground'}`}
                            onClick={() => setIsSheetOpen(false)}
                        >
                            {item.label}
                        </Link>
                    ))}
                    <div className="pt-4 border-t space-y-2">
                         <Button 
                            variant="ghost"
                            asChild
                            className="w-full justify-start text-lg font-medium text-muted-foreground">
                            <Link href="/hi/profile" onClick={() => setIsSheetOpen(false)}>
                                <User className="mr-2 h-5 w-5" />
                                प्रोफ़ाइल
                            </Link>
                        </Button>
                        <LanguageToggle inSheet={true} />
                    </div>
                </div>
                <div className="mt-auto border-t pt-4">
                    <Button 
                        variant="ghost" 
                        className="w-full justify-start text-lg font-medium text-muted-foreground"
                        onClick={handleLogout}>
                        <LogOut className="mr-2 h-5 w-5" />
                        लॉग आउट
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
