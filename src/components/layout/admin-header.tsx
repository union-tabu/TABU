
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
import { Menu, LogOut, User, Shield, Home } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import React from 'react';
import Image from 'next/image';

export function AdminHeader() {
  const { userData, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
    toast({
      title: "You have been logged out.",
      description: "You have been securely signed out of your account.",
    });
  };

  const navItems = [
    { href: '/admin', label: 'Dashboard' },
    // { href: '/admin/users', label: 'Users' },
    // { href: '/admin/payments', label: 'Payments' },
  ];
  
  const getInitials = (name: string | undefined) => {
    if (!name) return 'A';
    const nameParts = name.split(' ');
    const firstInitial = nameParts[0] ? nameParts[0][0] : '';
    const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1][0] : '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  }


  return (
    <header className="sticky top-0 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6 z-50">
        <Link
          href="/admin"
          className="flex items-center gap-2 text-lg font-semibold"
        >
          <Image src="/tabu-logo-website.png" alt="TABU Logo" width={40} height={40} className="h-10 w-auto" />
          <span className="font-bold">TABU Admin</span>
        </Link>
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        {navItems.map((item) => (
             <Link
                key={item.href}
                href={item.href}
                className={`transition-colors hover:text-foreground ${pathname === item.href ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}
            >
                {item.label}
            </Link>
        ))}
      </nav>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="rounded-full">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                        {loading ? '' : getInitials(userData?.fullName)}
                    </div>
                    <span className="sr-only">Toggle user menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                    {loading ? 'Loading...' : userData?.fullName}
                    <div className="text-xs text-muted-foreground font-normal">Administrator</div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link href="/profile"><User className="mr-2 h-4 w-4" />Profile</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" />Logout</DropdownMenuItem>
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
                            href="/admin" 
                            className="flex items-center gap-2" 
                            onClick={() => setIsSheetOpen(false)}
                        >
                            <Image src="/tabu-logo-website.png" alt="TABU Logo" width={40} height={40} className="h-10 w-auto" />
                            <span className="font-bold text-lg">TABU Admin</span>
                        </Link>
                    </SheetTitle>
                </SheetHeader>
                <div className="mt-8 flex flex-col space-y-4 flex-grow">
                    <div className="border-b pb-4">
                        <p className="text-sm font-medium text-muted-foreground px-2">
                            {loading ? 'Loading...' : userData?.fullName} (Admin)
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
                            <Link href="/profile" onClick={() => setIsSheetOpen(false)}>
                                <User className="mr-2 h-5 w-5" />
                                My Profile
                            </Link>
                        </Button>
                    </div>
                </div>
                <div className="mt-auto border-t pt-4">
                    <Button 
                        variant="ghost" 
                        className="w-full justify-start text-lg font-medium text-muted-foreground"
                        onClick={handleLogout}>
                        <LogOut className="mr-2 h-5 w-5" />
                        Logout
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
