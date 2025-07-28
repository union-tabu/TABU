
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
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export function DashboardHeaderTe() {
  const { userData, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('isAuthenticated');
      toast({
        title: "లాగ్ అవుట్ చేయబడింది",
        description: "మీరు విజయవంతంగా లాగ్ అవుట్ చేసారు.",
      });
      router.push('/te');
    } catch (error) {
      console.error("Logout Error:", error);
      toast({
        title: "లోపం",
        description: "మిమ్మల్ని లాగ్ అవుట్ చేయడం సాధ్యం కాలేదు. దయచేసి మళ్లీ ప్రయత్నించండి.",
        variant: "destructive",
      });
    }
  };

  const navItems = [
    { href: '/te/dashboard', label: 'డాష్‌బోర్డ్' },
    { href: '/te/dashboard/members', label: 'యూనియన్ సభ్యులు' },
    { href: '/te/dashboard/payments', label: 'చెల్లింపులు' },
  ];

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="/te"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <div className="w-8 h-8 bg-gray-300 rounded"></div>
          <span className="sr-only">సంఘిక సమాఖ్య</span>
        </Link>
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
      {/* Mobile Menu would go here */}
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto flex-1 sm:flex-initial">
          {/* Potentially a search bar */}
        </div>
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
              {loading ? 'లోడ్ అవుతోంది...' : `${userData?.firstName} ${userData?.lastName}`}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link href="/te/dashboard/profile">ప్రొఫైల్</Link>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>సెట్టింగ్‌లు</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>లాగ్ అవుట్</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
