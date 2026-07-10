import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckRowProps {
  checked: boolean;
  label: string;
  sublabel?: string;
  onToggle: () => void;
  disabled?: boolean;
}

// A big, thumb-friendly checkable row for the daily checklist.
const CheckRow: React.FC<CheckRowProps> = ({ checked, label, sublabel, onToggle, disabled }) => (
  <button
    type="button"
    onClick={onToggle}
    disabled={disabled}
    aria-pressed={checked}
    className={cn(
      'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all active:scale-[0.99]',
      checked ? 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20' : 'hover:border-primary/40',
    )}
  >
    <span
      className={cn(
        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
        checked ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-muted-foreground/40',
      )}
    >
      {checked && <Check className="h-4 w-4" />}
    </span>
    <span className="min-w-0 flex-1">
      <span className={cn('block truncate text-sm font-medium', checked && 'text-muted-foreground line-through')}>
        {label}
      </span>
      {sublabel && <span className="block truncate text-xs text-muted-foreground">{sublabel}</span>}
    </span>
  </button>
);

export default CheckRow;
