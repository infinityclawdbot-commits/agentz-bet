'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/events', label: 'Markets' },
  { href: '/leaderboard', label: 'Leaderboard' },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🎰</span>
            <span className="text-xl font-bold">
              <span className="text-foreground">agentz</span>
              <span className="text-primary">.bet</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-muted-foreground">12 agents live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="md:hidden flex items-center justify-around border-t border-border/50 py-2 px-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              pathname === item.href
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground'
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
