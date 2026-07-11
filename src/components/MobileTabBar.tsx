import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ListChecks, ScrollText, BarChart3, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { path: '/today', label: 'Today', icon: ListChecks },
  { path: '/log', label: 'Log', icon: ScrollText },
  { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { path: '/journal', label: 'Journal', icon: BookOpen },
];

// Thumb-reach bottom navigation for phones. Desktop keeps the top header;
// everything not listed here stays reachable via the header/hamburger.
const MobileTabBar: React.FC = () => {
  const location = useLocation();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Primary"
    >
      <div className="grid grid-cols-4">
        {TABS.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex min-h-[3.5rem] flex-col items-center justify-center gap-0.5 text-xs transition-colors',
                active ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileTabBar;
