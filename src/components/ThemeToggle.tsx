import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/lib/ThemeContext';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  invert?: boolean; // header is on a transparent background — use white-ish icon
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ invert }) => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const Icon = resolvedTheme === 'dark' ? Moon : Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-8 w-8', invert && 'text-white/90 hover:text-white')}
          aria-label="Theme"
          title="Theme"
        >
          <Icon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuCheckboxItem checked={theme === 'light'} onCheckedChange={() => setTheme('light')}>
          <Sun className="mr-2 h-4 w-4" /> Light
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={theme === 'dark'} onCheckedChange={() => setTheme('dark')}>
          <Moon className="mr-2 h-4 w-4" /> Dark
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={theme === 'system'} onCheckedChange={() => setTheme('system')}>
          <Monitor className="mr-2 h-4 w-4" /> System
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeToggle;
