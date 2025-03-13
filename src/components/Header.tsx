
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, BarChart, Dumbbell, Clock, LogIn, LogOut, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';

interface HeaderProps {
  transparent?: boolean;
}

const Header: React.FC<HeaderProps> = ({ transparent = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  const isLandingPage = location.pathname === '/';
  
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: BarChart },
    { name: 'Weight', path: '/weight', icon: BarChart },
    { name: 'Fasting', path: '/fasting', icon: Clock },
    { name: 'Exercise', path: '/exercise', icon: Dumbbell },
    { name: 'Periods', path: '/periods', icon: Calendar },
    { name: 'Profile', path: '/profile', icon: User },
  ];

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
          <div className={cn(
            "font-bold text-2xl",
            (transparent && !scrolled && !isOpen) ? "text-white" : "gradient-text"
          )}>
            HealthZone
          </div>
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          {user ? (
            <>
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "flex items-center space-x-1 font-medium transition-colors hover:text-primary relative py-2",
                    (transparent && !scrolled) ? "text-white/90 hover:text-white" : "text-foreground/80 hover:text-foreground",
                    location.pathname === link.path && "text-primary font-semibold"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  <span>{link.name}</span>
                  {location.pathname === link.path && (
                    <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary rounded-full"></span>
                  )}
                </Link>
              ))}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={signOut}
                className={cn(
                  "flex items-center space-x-1",
                  (transparent && !scrolled) ? "text-white/90 hover:text-white" : ""
                )}
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Link 
                to="/auth" 
                className={cn(
                  "font-medium transition-colors",
                  (transparent && !scrolled) ? "text-white/90 hover:text-white" : "text-foreground/80 hover:text-foreground"
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
            <X className={cn("h-6 w-6", (transparent && !scrolled) ? "text-white" : "")} />
          ) : (
            <Menu className={cn("h-6 w-6", (transparent && !scrolled) ? "text-white" : "")} />
          )}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden absolute top-[60px] left-0 right-0 bg-background shadow-lg border-b border-border/40 animate-fade-in">
          <div className="p-4 space-y-3">
            {user ? (
              <>
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      "flex items-center space-x-2 p-3 rounded-md transition-colors relative",
                      location.pathname === link.path 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "hover:bg-secondary"
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
                <Button 
                  variant="ghost" 
                  className="w-full justify-start p-3" 
                  onClick={() => {
                    signOut();
                    setIsOpen(false);
                  }}
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  <span>Logout</span>
                </Button>
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
