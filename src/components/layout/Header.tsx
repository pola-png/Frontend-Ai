'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/shared/Icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/matches', label: 'Matches' },
  { href: '/results', label: 'Results' },
];

const predictionNavItems = [
  { href: '/predictions/vip', label: 'VIP Picks' },
  { href: '/predictions/2odds', label: 'Daily 2+ Odds' },
  { href: '/predictions/5odds', label: 'Value 5+ Odds' },
  { href: '/predictions/big10', label: 'Big 10+ Odds' },
];

function MainNav() {
  const pathname = usePathname();
  return (
    <>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'transition-colors hover:text-foreground/80',
            pathname === item.href ? 'text-foreground' : 'text-foreground/60'
          )}
        >
          {item.label}
        </Link>
      ))}
      <DropdownMenu>
        <DropdownMenuTrigger className={cn(
          'flex items-center gap-1 transition-colors hover:text-foreground/80',
          predictionNavItems.some(item => pathname.startsWith(item.href)) ? 'text-foreground' : 'text-foreground/60'
        )}>
          Predictions <ChevronDown className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {predictionNavItems.map((item) => (
            <DropdownMenuItem key={item.href} asChild>
              <Link href={item.href}>{item.label}</Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Icons.logo className="h-6 w-6 text-primary" />
            <span className="font-bold">AI Football Prediction</span>
          </Link>
        </div>

        <nav className="flex flex-1 items-center space-x-4 text-sm font-medium sm:space-x-6">
          <MainNav />
        </nav>
      </div>
    </header>
  );
}
