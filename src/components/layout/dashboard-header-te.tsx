
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
import { HardHat, Languages } from 'lucide-react';

function LanguageToggle() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (lang: 'en' | 'te') => {
    const isTelugu = pathname.startsWith('/te');
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
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Languages className="h-5 w-5" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
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


export function DashboardHeaderTe() {
  const { userData, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    await logout();
    router.push('/te');
    toast({
      title: "లాగ్ అవుట్ చేయబడింది",
      description: "మీరు విజయవంతంగా లాగ్ అవుట్ చేసారు.",
    });
  };

  const navItems = [
    { href: '/te/dashboard', label: 'డాష్‌బోర్డ్' },
    { href: '/te/union-members', label: 'యూనియన్ సభ్యులు' },
    { href: '/te/payments', label: 'చెల్లింపులు' },
    { href: '/te/subscribe', label: 'సభ్యత్వం' },
  ];

  return (
    <header className="sticky top-0 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6 z-50">
       <Link
          href="/te"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <HardHat className="w-8 h-8 text-primary" />
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
        <LanguageToggle />
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
                <Link href="/te/profile">ప్రొఫైల్</Link>
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
