import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pill, Ban } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useDailyTracking } from '@/hooks/useDailyTracking';
import { useTodayChecklist } from '@/hooks/useTodayChecklist';
import { resolveTrackerIcon, isEmojiIcon } from '@/components/tracking/trackerIcons';
import VitalsQuickDialog from '@/components/tracking/VitalsQuickDialog';

// Floating quick-log button for phones: log the high-frequency stuff (tracker
// tallies, PRN doses, vitals) from any page without navigating to /today.
// The sheet stays open after each tap so several things can be logged at once.
const QuickLogSheet: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { eventTypes, totals, logEvent, isLogging } = useDailyTracking();
  const { prnItems, takePrn } = useTodayChecklist();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Quick log"
          className="fixed right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95 md:hidden"
          style={{ bottom: 'calc(4.5rem + env(safe-area-inset-bottom))' }}
        >
          <Plus className="h-7 w-7" />
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[80dvh] overflow-y-auto rounded-t-2xl pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <SheetHeader className="text-left">
          <SheetTitle>Quick log</SheetTitle>
        </SheetHeader>

        {eventTypes.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {eventTypes.map((et) => {
              const Icon = resolveTrackerIcon(et.icon);
              const emoji = isEmojiIcon(et.icon) ? et.icon : null;
              const total = totals[et.key] ?? 0;
              return (
                <button
                  key={et.id}
                  type="button"
                  disabled={isLogging}
                  onClick={() => logEvent(et)}
                  className="flex min-h-[3.5rem] items-center gap-3 rounded-xl border bg-card p-3 text-left transition-all active:scale-[0.97] hover:border-primary/50"
                >
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {emoji ? <span className="text-lg leading-none">{emoji}</span> : <Icon className="h-4 w-4" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">+ {et.label}</span>
                    <span className="block text-xs text-muted-foreground tabular-nums">
                      {total % 1 === 0 ? total : total.toFixed(1)}
                      {et.dailyTarget != null ? ` / ${et.dailyTarget}` : ''}
                      {et.unit ? ` ${et.unit}` : ''} today
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {prnItems.length > 0 && (
          <div className="mt-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              As-needed meds
            </div>
            <div className="space-y-2">
              {prnItems.map((item) => (
                <button
                  key={item.med.id}
                  type="button"
                  disabled={!item.canTake}
                  onClick={() => takePrn(item.med)}
                  className={cn(
                    'flex w-full min-h-[3.5rem] items-center gap-3 rounded-xl border bg-card p-3 text-left transition-all',
                    item.canTake ? 'active:scale-[0.97] hover:border-primary/50' : 'opacity-60'
                  )}
                >
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {item.canTake ? <Pill className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      {item.med.name}
                      {item.med.dose ? ` · ${item.med.dose}` : ''}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {item.canTake
                        ? `${item.takenCount} taken today`
                        : item.blockReason ?? 'Not available yet'}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-3">
          <VitalsQuickDialog />
          <Link
            to="/today"
            onClick={() => setOpen(false)}
            className="text-sm font-medium text-primary hover:underline"
          >
            Open Today →
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default QuickLogSheet;
