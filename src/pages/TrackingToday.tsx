import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { Loader2, HeartPulse, Check } from 'lucide-react';
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

// Days since surgery ("POD"), derived from the most recent past surgery milestone.
function usePostOpDay() {
  return useQuery({
    queryKey: ['milestones'],
    queryFn: getMilestones,
    select: (milestones) => {
      const today = new Date();
      const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const past = milestones
        .filter((m) => m.type === 'surgery' && new Date(`${m.date}T12:00:00`) <= todayMid)
        .sort((a, b) => b.date.localeCompare(a.date));
      if (past.length === 0) return null;
      const surgery = new Date(`${past[0].date}T12:00:00`);
      const days = Math.floor((todayMid.getTime() - surgery.getTime()) / 86_400_000);
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

const PrnRow: React.FC<{ item: PrnItem; onTake: () => void }> = ({ item, onTake }) => {
  const { med, takenCount, canTake, blockReason } = item;
  const cap = med.maxPerDay ? ` · max ${med.maxPerDay}/day` : '';
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border p-3">
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{med.name}</div>
        <div className="text-xs text-muted-foreground">
          {med.dose ? `${med.dose} · ` : ''}{takenCount} today{cap}
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
  const { eventTypes, totals, logEvent, undoLast, isLogging } = useDailyTracking();
  const { slotGroups, prnItems, checks, vitalsLoggedToday, progress, isLoading, toggleDose, takePrn, toggleCheck } =
    useTodayChecklist();
  const { data: postOpDay } = usePostOpDay();

  const todayLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;
  const hasMeds = slotGroups.length > 0 || prnItems.length > 0;

  return (
    <Layout>
      <div className="container mx-auto max-w-3xl p-4 pt-24 pb-32">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Today</h1>
          <p className="text-sm text-muted-foreground">
            {todayLabel}
            {postOpDay != null && (
              <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                Post-op day {postOpDay}
              </span>
            )}
          </p>
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
                        <PrnRow key={item.med.id} item={item} onTake={() => takePrn(item.med)} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tally trackers */}
            <SectionHeader title="Trackers" action={<TrackerManagerDialog />} />
            {eventTypes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Starter trackers (water, ostomy, bag changes) are added automatically.</p>
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
            <SectionHeader title="Vitals" action={<VitalsQuickDialog />} />
            <div
              className={cn(
                'flex items-center gap-3 rounded-xl border p-3',
                vitalsLoggedToday && 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20',
              )}
            >
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full',
                  vitalsLoggedToday ? 'bg-emerald-500 text-white' : 'bg-primary/10 text-primary',
                )}
              >
                {vitalsLoggedToday ? <Check className="h-4 w-4" /> : <HeartPulse className="h-4 w-4" />}
              </span>
              <span className="text-sm">
                {vitalsLoggedToday ? 'Vitals logged today' : 'No vitals logged yet today'}
              </span>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default TrackingToday;
