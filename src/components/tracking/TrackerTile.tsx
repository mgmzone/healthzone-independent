import React from 'react';
import { EventType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { resolveTrackerIcon, isEmojiIcon } from './trackerIcons';
import { Undo2 } from 'lucide-react';

interface TrackerTileProps {
  eventType: EventType;
  total: number;               // summed quantity logged for the day shown
  onLog: () => void;
  onUndo: () => void;
  disabled?: boolean;
  isToday?: boolean;           // false when browsing/backfilling a past day
}

// A single one-tap tracker. Tapping the tile logs the tracker's default quantity;
// the small corner button undoes the last entry. Shows today's progress toward
// the optional daily target.
const TrackerTile: React.FC<TrackerTileProps> = ({ eventType, total, onLog, onUndo, disabled, isToday = true }) => {
  const Icon = resolveTrackerIcon(eventType.icon);
  const emoji = isEmojiIcon(eventType.icon) ? eventType.icon : null;
  const target = eventType.dailyTarget;
  const pct = target && target > 0 ? Math.min(100, (total / target) * 100) : 0;
  const met = target != null && total >= target;
  const unitLabel = eventType.unit ? ` ${eventType.unit}` : '';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onLog}
        disabled={disabled}
        aria-label={`Log ${eventType.label}`}
        className={cn(
          'w-full rounded-2xl border bg-card p-4 text-left transition-all',
          'active:scale-[0.97] hover:border-primary/50 hover:shadow-sm',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          'flex flex-col gap-3 min-h-[7.5rem]',
          met && 'border-emerald-500/60 bg-emerald-50/50 dark:bg-emerald-950/20'
        )}
      >
        <div className="flex items-center justify-between">
          <span
            className={cn(
              'inline-flex h-10 w-10 items-center justify-center rounded-full',
              met ? 'bg-emerald-500/15 text-emerald-600' : 'bg-primary/10 text-primary'
            )}
          >
            {emoji ? <span className="text-xl leading-none">{emoji}</span> : <Icon className="h-5 w-5" />}
          </span>
          <span className="text-2xl font-semibold tabular-nums">
            {total % 1 === 0 ? total : total.toFixed(1)}
          </span>
        </div>

        <div>
          <div className="text-sm font-medium text-foreground">{eventType.label}</div>
          <div className="text-xs text-muted-foreground">
            {target != null
              ? `of ${target}${unitLabel}${isToday ? ' today' : ''}`
              : `logged${isToday ? ' today' : ''}${unitLabel ? ` (${eventType.unit})` : ''}`}
          </div>
        </div>

        {target != null && (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn('h-full rounded-full transition-all', met ? 'bg-emerald-500' : 'bg-primary')}
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
      </button>

      {total > 0 && (
        <button
          type="button"
          onClick={onUndo}
          aria-label={`Undo last ${eventType.label}`}
          className="absolute -right-2 -top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm hover:text-foreground"
        >
          <Undo2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default TrackerTile;
