import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { Loader2, HeartPulse, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { getMilestones } from '@/lib/services/milestonesService';
import { useDailyTracking } from '@/hooks/useDailyTracking';
import { useTodayChecklist, PrnItem } from '@/hooks/useTodayChecklist';
import TrackerTile from '@/components/tracking/TrackerTile';
import CheckRow from '@/components/tracking/CheckRow';
import VitalsQuickDialog from '@/components/tracking/VitalsQuickDialog';
import TrackerManagerDialog from '@/components/tracking/TrackerManagerDialog';
import MedicationManagerDialog from '@/components/tracking/MedicationManagerDialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toLocalDateString, isLocalToday } from '@/lib/utils/dateUtils';

// Days since surgery ("POD") as of the given date, derived from the most
// recent surgery milestone on or before it.
function usePostOpDay(asOf: Date) {
  return useQuery({
    queryKey: ['milestones'],
    queryFn: getMilestones,
    select: (milestones) => {
      const asOfMid = new Date(asOf.getFullYear(), asOf.getMonth(), asOf.getDate());
      const past = milestones
        .filter((m) => m.type === 'surgery' && new Date(`${m.date}T12:00:00`) <= asOfMid)
        .sort((a, b) => b.date.localeCompare(a.date));
      if (past.length === 0) return null;
      const surgery = new Date(`${past[0].date}T12:00:00`);
      const days = Math.floor((asOfMid.getTime() - surgery.getTime()) / 86_400_000);
      return days >= 0 ? days : null;
    },
  });
}

const SectionHeader: React.FC<{ title: string; action?: React.ReactNode }> = ({ title, action }) => (
  <div className="mb-2 mt-6 flex items-center justify-between">
    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
    {action}
  </div>
);

const PrnRow: React.FC<{ item: PrnItem; isToday: boolean; onTake: () => void }> = ({ item, isToday, onTake }) => {
  const { med, takenCount, canTake, blockReason } = item;
  const cap = med.maxPerDay ? ` · max ${med.maxPerDay}/day` : '';
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border p-3">
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{med.name}</div>
        <div className="text-xs text-muted-foreground">
          {med.dose ? `${med.dose} · ` : ''}{takenCount} {isToday ? 'today' : 'this day'}{cap}
          {blockReason ? ` · ${blockReason}` : ''}
        </div>
      </div>
      <Button size="sm" variant={canTake ? 'default' : 'outline'} disabled={!canTake} onClick={onTake}>
        Take one
      </Button>
    </div>
  );
};

const TrackingToday: React.FC = () => {
  // Midnight-local anchor for the day being viewed; back/forward shifts it,
  // capped at today (no logging into the future).
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  });
  const isToday = isLocalToday(selectedDate);
  const shiftDay = (delta: number) =>
    setSelectedDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + delta));
  const goToToday = () => {
    const now = new Date();
    setSelectedDate(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
  };

  const { eventTypes, totals, logEvent, undoLast, isLogging } = useDailyTracking(selectedDate);
  const { slotGroups, prnItems, checks, vitalsLogged, progress, isLoading, toggleDose, takePrn, toggleCheck } =
    useTodayChecklist(selectedDate);
  const { data: postOpDay } = usePostOpDay(selectedDate);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = toLocalDateString(selectedDate) === toLocalDateString(yesterday);

  const title = isToday ? 'Today' : isYesterday ? 'Yesterday' : selectedDate.toLocaleDateString(undefined, { weekday: 'long' });
  const dayLabel = selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;
  const hasMeds = slotGroups.length > 0 || prnItems.length > 0;

  return (
    <Layout>
      <div className="container mx-auto max-w-3xl p-4 pt-24 pb-32">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-sm text-muted-foreground">
              {dayLabel}
              {postOpDay != null && (
                <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  Post-op day {postOpDay}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-1 pt-1">
            <Button variant="outline" size="icon" aria-label="Previous day" onClick={() => shiftDay(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {!isToday && (
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
            )}
            <Button variant="outline" size="icon" aria-label="Next day" disabled={isToday} onClick={() => shiftDay(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Daily progress */}
        {progress.total > 0 && (
          <div className="mb-2">
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>{progress.done} of {progress.total} done</span>
              <span>{pct}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <>
            {/* Medications, grouped by time of day */}
            <SectionHeader title="Medications" action={<MedicationManagerDialog />} />
            {!hasMeds ? (
              <p className="text-sm text-muted-foreground">No medications yet. Add them with Manage to build your daily schedule.</p>
            ) : (
              <div className="space-y-4">
                {slotGroups.map((group) => (
                  <div key={group.slot}>
                    <div className="mb-1.5 text-xs font-medium text-muted-foreground">{group.label}</div>
                    <div className="space-y-2">
                      {group.items.map((item) => (
                        <CheckRow
                          key={`${item.med.id}-${item.slot}`}
                          checked={item.taken}
                          label={item.med.name}
                          sublabel={item.med.dose}
                          onToggle={() => toggleDose(item)}
                        />
                      ))}
                    </div>
                  </div>
                ))}

                {prnItems.length > 0 && (
                  <div>
                    <div className="mb-1.5 text-xs font-medium text-muted-foreground">As needed</div>
                    <div className="space-y-2">
                      {prnItems.map((item) => (
                        <PrnRow key={item.med.id} item={item} isToday={isToday} onTake={() => takePrn(item.med)} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tally trackers */}
            <SectionHeader title="Trackers" action={<TrackerManagerDialog />} />
            {eventTypes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Starter trackers (fluids, ostomy, bag changes) are added automatically.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {eventTypes.map((et) => (
                  <TrackerTile
                    key={et.id}
                    eventType={et}
                    total={totals[et.key] ?? 0}
                    onLog={() => logEvent(et)}
                    onUndo={() => undoLast(et.key)}
                    disabled={isLogging}
                    isToday={isToday}
                  />
                ))}
              </div>
            )}

            {/* Binary daily checks */}
            {checks.length > 0 && (
              <>
                <SectionHeader title="Daily checks" />
                <div className="space-y-2">
                  {checks.map((c) => (
                    <CheckRow
                      key={c.goal.id}
                      checked={c.met}
                      label={c.goal.name}
                      sublabel={c.goal.description}
                      onToggle={() => toggleCheck(c)}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Vitals */}
            <SectionHeader title="Vitals" action={<VitalsQuickDialog date={selectedDate} />} />
            <div
              className={cn(
                'flex items-center gap-3 rounded-xl border p-3',
                vitalsLogged && 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20',
              )}
            >
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full',
                  vitalsLogged ? 'bg-emerald-500 text-white' : 'bg-primary/10 text-primary',
                )}
              >
                {vitalsLogged ? <Check className="h-4 w-4" /> : <HeartPulse className="h-4 w-4" />}
              </span>
              <span className="text-sm">
                {vitalsLogged
                  ? `Vitals logged ${isToday ? 'today' : 'this day'}`
                  : `No vitals logged ${isToday ? 'yet today' : 'this day'}`}
              </span>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default TrackingToday;
