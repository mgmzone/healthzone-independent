import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  className?: string;
}

const normalize = (raw: string) => raw.trim().toLowerCase().replace(/^#+/, '');

const TagInput: React.FC<TagInputProps> = ({
  value,
  onChange,
  suggestions = [],
  placeholder = 'Add tag and press Enter…',
  className,
}) => {
  const [draft, setDraft] = useState('');

  const addTag = (raw: string) => {
    const tag = normalize(raw);
    if (!tag || value.includes(tag)) return;
    onChange([...value, tag]);
    setDraft('');
  };

  const removeTag = (tag: string) => onChange(value.filter((t) => t !== tag));

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
      if (draft.trim()) {
        e.preventDefault();
        addTag(draft);
      }
    } else if (e.key === 'Backspace' && !draft && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  const unusedSuggestions = suggestions.filter((s) => !value.includes(s));

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap items-center gap-1.5 rounded-md border bg-background px-2 py-1.5 min-h-10 focus-within:ring-2 focus-within:ring-ring">
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1">
            #{tag}
            <button
              type="button"
              className="ml-0.5 hover:text-destructive"
              onClick={() => removeTag(tag)}
              aria-label={`Remove ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKey}
          onBlur={() => draft.trim() && addTag(draft)}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] border-0 shadow-none focus-visible:ring-0 px-1 h-7"
        />
      </div>
      {unusedSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          <span className="text-xs text-muted-foreground self-center mr-1">Recent:</span>
          {unusedSuggestions.slice(0, 12).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => addTag(tag)}
              className="text-xs px-2 py-0.5 rounded-full border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagInput;
