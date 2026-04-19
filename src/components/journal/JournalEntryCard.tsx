import React, { useState } from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash, ChevronDown, ChevronUp } from 'lucide-react';
import { JournalEntry } from '@/lib/types';

interface JournalEntryCardProps {
  entry: JournalEntry;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
}

const MOOD_EMOJI = ['', '😞', '😐', '🙂', '😊', '😄'];

const formatEntryDate = (iso: string): { weekday: string; date: string } => {
  const d = new Date(iso + 'T12:00:00');
  return {
    weekday: format(d, 'EEE'),
    date: format(d, 'MMM d, yyyy'),
  };
};

const PREVIEW_CHAR_LIMIT = 420;

const JournalEntryCard: React.FC<JournalEntryCardProps> = ({ entry, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const { weekday, date } = formatEntryDate(entry.entryDate);
  const isLong = entry.body.length > PREVIEW_CHAR_LIMIT;
  const shownBody =
    expanded || !isLong ? entry.body : entry.body.slice(0, PREVIEW_CHAR_LIMIT) + '…';

  const timeLabel = entry.entryTime
    ? format(new Date(`2000-01-01T${entry.entryTime}`), 'h:mm a')
    : null;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">{weekday}</span>
            <h3 className="font-semibold text-base">{date}</h3>
            {timeLabel && <span className="text-sm text-muted-foreground">· {timeLabel}</span>}
          </div>
          {entry.title && <div className="text-sm font-medium mt-0.5">{entry.title}</div>}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {entry.mood != null && (
            <span className="text-lg" title={`Mood ${entry.mood}/5`}>
              {MOOD_EMOJI[entry.mood] || ''}
            </span>
          )}
          {entry.painLevel != null && (
            <Badge variant="outline" className="text-xs font-normal">
              Pain {entry.painLevel}/10
            </Badge>
          )}
          <Button size="sm" variant="ghost" onClick={() => onEdit(entry)} aria-label="Edit entry">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-500 hover:text-red-700"
            onClick={() => onDelete(entry.id)}
            aria-label="Delete entry"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="text-sm whitespace-pre-wrap text-foreground leading-relaxed">{shownBody}</div>

      {isLong && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 text-xs text-muted-foreground hover:text-foreground px-0"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" /> Collapse
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" /> Read more
            </>
          )}
        </Button>
      )}

      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {entry.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs font-normal">
              #{tag}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  );
};

export default JournalEntryCard;
