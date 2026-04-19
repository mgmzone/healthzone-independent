
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  User,
  BarChart,
  Dumbbell,
  Clock,
  LogIn,
  LogOut,
  Calendar,
  Scale,
  ShieldCheck,
  Apple,
  BookOpen,
  Sun,
  Moon,
  Monitor,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  transparent?: boolean;
}

const Header: React.FC<HeaderProps> = ({ transparent = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Primary nav — ordered to roughly mirror a user's daily flow:
  // Dashboard → what to eat / log → exercise & fasting → weight → journal → periods
  const primaryLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: BarChart },
    { name: 'Nutrition', path: '/nutrition', icon: Apple },
    { name: 'Exercise', path: '/exercise', icon: Dumbbell },
    { name: 'Fasting', path: '/fasting', icon: Clock },
    { name: 'Weight', path: '/weight', icon: Scale },
    { name: 'Journal', path: '/journal', icon: BookOpen },
  ];

  const displayName = profile
    ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || user?.email || 'Account'
    : user?.email || 'Account';

  const handleLogout = () => {
    signOut();
    setIsOpen(false);
  };

  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-300 ease-in-out px-4 sm:px-6 lg:px-8',
        transparent && !scrolled && !isOpen
          ? 'bg-transparent text-white'
          : 'bg-background/80 backdrop-blur-md border-b',
        { 'py-6': transparent && !scrolled && !isOpen, 'py-3': !transparent || scrolled || isOpen }
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div
            className={cn(
              'font-bold text-2xl',
              transparent && !scrolled && !isOpen ? 'text-white' : 'gradient-text'
            )}
          >
            HealthZone
          </div>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 lg:space-x-7">
          {user ? (
            <>
              {primaryLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    'flex items-center space-x-1 font-medium transition-colors hover:text-primary relative py-2',
                    transparent && !scrolled
                      ? 'text-white/90 hover:text-white'
                      : 'text-foreground/80 hover:text-foreground',
                    location.pathname === link.path && 'text-primary font-semibold'
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  <span>{link.name}</span>
                  {location.pathname === link.path && (
                    <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary rounded-full"></span>
                  )}
                </Link>
              ))}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'flex items-center gap-1 font-medium',
                      transparent && !scrolled ? 'text-white/90 hover:text-white' : ''
                    )}
                    aria-label="Account menu"
                  >
                    <User className="h-4 w-4" />
                    <ChevronDown className="h-3 w-3 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="text-xs text-muted-foreground">Signed in as</div>
                    <div className="text-sm font-medium truncate">{displayName}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => navigate('/periods')}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Periods
                  </DropdownMenuItem>
                  {profile?.isAdmin && (
                    <DropdownMenuItem onSelect={() => navigate('/admin')}>
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Admin
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      {theme === 'dark' ? (
                        <Moon className="mr-2 h-4 w-4" />
                      ) : theme === 'light' ? (
                        <Sun className="mr-2 h-4 w-4" />
                      ) : (
                        <Monitor className="mr-2 h-4 w-4" />
                      )}
                      Theme
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuRadioGroup
                          value={theme}
                          onValueChange={(v) => setTheme(v as 'light' | 'dark' | 'system')}
                        >
                          <DropdownMenuRadioItem value="light">
                            <Sun className="mr-2 h-4 w-4" /> Light
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="dark">
                            <Moon className="mr-2 h-4 w-4" /> Dark
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="system">
                            <Monitor className="mr-2 h-4 w-4" /> System
                          </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                className={cn(
                  'font-medium transition-colors',
                  transparent && !scrolled
                    ? 'text-white/90 hover:text-white'
                    : 'text-foreground/80 hover:text-foreground'
                )}
              >
                Login
              </Link>
              <Button asChild size="sm" className="rounded-full px-6">
                <Link to="/auth?tab=signup">Sign Up</Link>
              </Button>
            </>
          )}
        </nav>

        <button
          className="md:hidden p-2 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X className={cn('h-6 w-6', transparent && !scrolled ? 'text-white' : '')} />
          ) : (
            <Menu className={cn('h-6 w-6', transparent && !scrolled ? 'text-white' : '')} />
          )}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden absolute top-[60px] left-0 right-0 bg-background shadow-lg border-b border-border/40 animate-fade-in">
          <div className="p-4 space-y-3">
            {user ? (
              <>
                {primaryLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      'flex items-center space-x-2 p-3 rounded-md transition-colors relative',
                      location.pathname === link.path
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-secondary'
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <link.icon className="h-5 w-5" />
                    <span>{link.name}</span>
                    {location.pathname === link.path && (
                      <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary rounded-full"></span>
                    )}
                  </Link>
                ))}

                <div className="border-t pt-3 mt-3 space-y-1">
                  <Link
                    to="/profile"
                    className={cn(
                      'flex items-center space-x-2 p-3 rounded-md transition-colors',
                      location.pathname === '/profile'
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-secondary'
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    to="/periods"
                    className={cn(
                      'flex items-center space-x-2 p-3 rounded-md transition-colors',
                      location.pathname === '/periods'
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-secondary'
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <Calendar className="h-5 w-5" />
                    <span>Periods</span>
                  </Link>
                  {profile?.isAdmin && (
                    <Link
                      to="/admin"
                      className={cn(
                        'flex items-center space-x-2 p-3 rounded-md transition-colors',
                        location.pathname === '/admin'
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'hover:bg-secondary'
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <ShieldCheck className="h-5 w-5" />
                      <span>Admin</span>
                    </Link>
                  )}
                  <div className="flex items-center justify-between p-3">
                    <span className="text-sm text-muted-foreground">Theme</span>
                    <ThemeToggle />
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start p-3"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    <span>Logout</span>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="flex items-center space-x-2 p-3 rounded-md transition-colors hover:bg-secondary"
                  onClick={() => setIsOpen(false)}
                >
                  <LogIn className="h-5 w-5" />
                  <span>Login</span>
                </Link>
                <Button asChild className="w-full justify-center rounded-md">
                  <Link to="/auth?tab=signup" onClick={() => setIsOpen(false)}>
                    Sign Up
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
