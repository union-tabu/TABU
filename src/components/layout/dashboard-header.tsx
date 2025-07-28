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

export function DashboardHeader() {
  const { userData, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.push('/');
    } catch (error) {
      console.error("Logout Error:", error);
      toast({
        title: "Error",
        description: "Could not log you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/subscribe', label: 'Subscribe' },
    { href: '/dashboard/payments', label: 'Payments' },
  ];

  return (
    <header className="sticky top-0 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6 z-50">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <div className="w-8 h-8 bg-gray-300 rounded"></div>
          <span className="sr-only">Sanghika Samakhya</span>
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
      <div className="flex items-center gap-4 md:gap-2 lg:gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              {/* Using a fallback for when user data is loading */}
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                 {loading ? '' : userData?.firstName?.[0]}{userData?.lastName?.[0]}
              </div>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {loading ? 'Loading...' : `${userData?.firstName} ${userData?.lastName}`}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
