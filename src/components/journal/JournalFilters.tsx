import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface JournalFiltersState {
  search: string;
  dateFrom: string;
  dateTo: string;
  tags: string[];
}

interface JournalFiltersProps {
  state: JournalFiltersState;
  onChange: (next: JournalFiltersState) => void;
  availableTags: string[];
}

const JournalFilters: React.FC<JournalFiltersProps> = ({ state, onChange, availableTags }) => {
  const toggleTag = (tag: string) => {
    onChange({
      ...state,
      tags: state.tags.includes(tag)
        ? state.tags.filter((t) => t !== tag)
        : [...state.tags, tag],
    });
  };

  const clearAll = () =>
    onChange({ search: '', dateFrom: '', dateTo: '', tags: [] });

  const hasAny =
    !!state.search || !!state.dateFrom || !!state.dateTo || state.tags.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={state.search}
            onChange={(e) => onChange({ ...state, search: e.target.value })}
            placeholder="Search entries…"
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={state.dateFrom}
            onChange={(e) => onChange({ ...state, dateFrom: e.target.value })}
            className="w-auto"
            aria-label="From date"
          />
          <span className="text-muted-foreground text-sm">to</span>
          <Input
            type="date"
            value={state.dateTo}
            onChange={(e) => onChange({ ...state, dateTo: e.target.value })}
            className="w-auto"
            aria-label="To date"
          />
        </div>
        {hasAny && (
          <Button variant="ghost" size="sm" onClick={clearAll}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {availableTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {availableTags.map((tag) => {
            const active = state.tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-xs border transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      )}

      {state.tags.length > 0 && (
        <div className="text-xs text-muted-foreground">
          Showing entries tagged with any of:{' '}
          {state.tags.map((t) => (
            <Badge key={t} variant="secondary" className="ml-1 text-xs font-normal">
              #{t}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default JournalFilters;
