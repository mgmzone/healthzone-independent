import React from 'react';
import { Milestone, milestoneTypeLabel } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Local-noon parse so a date-only string doesn't shift a day in US timezones.
function parseLocal(dateStr: string): Date {
  return new Date(`${dateStr}T12:00:00`);
}

function dayDiffFromToday(dateStr: string): number {
  const d = parseLocal(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((d.getTime() - today.getTime()) / 86_400_000);
}

function relativeLabel(dateStr: string): string {
  const diff = dayDiffFromToday(dateStr);
  if (diff === 0) return 'Today';
  if (diff > 0) return diff === 1 ? 'Tomorrow' : `in ${diff} days`;
  return diff === -1 ? 'Yesterday' : `${Math.abs(diff)} days ago`;
}

interface MilestoneTimelineProps {
  milestones: Milestone[];
}

const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({ milestones }) => {
  if (milestones.length === 0) {
    return <p className="text-sm text-muted-foreground">No milestones yet — add one to see your timeline.</p>;
  }

  const sorted = [...milestones].sort((a, b) => a.date.localeCompare(b.date));
  const firstFutureIdx = sorted.findIndex((m) => dayDiffFromToday(m.date) >= 0);

  return (
    <ol className="relative ml-3 border-l">
      {sorted.map((m, i) => {
        const diff = dayDiffFromToday(m.date);
        const isToday = diff === 0;
        const isPast = diff < 0;
        // Divider marking "now" between the last past and first future milestone.
        const showNow = i === firstFutureIdx && firstFutureIdx > 0 && !isToday;
        return (
          <React.Fragment key={m.id}>
            {showNow && (
              <li className="mb-4 ml-4">
                <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
                <span className="text-xs font-semibold uppercase tracking-wide text-primary">Today</span>
              </li>
            )}
            <li className="mb-5 ml-4">
              <span
                className={cn(
                  'absolute -left-[7px] mt-1.5 h-3.5 w-3.5 rounded-full border-2 border-background',
                  isToday ? 'bg-primary' : isPast ? 'bg-muted-foreground/50' : 'bg-emerald-500',
                )}
              />
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{m.name}</span>
                <Badge variant="secondary" className="text-xs">{milestoneTypeLabel(m.type)}</Badge>
                {m.isPriority && <Badge className="bg-amber-500 text-xs hover:bg-amber-500">Priority</Badge>}
              </div>
              <div className="text-xs text-muted-foreground">
                {parseLocal(m.date).toLocaleDateString(undefined, {
                  weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
                })}
                {' · '}
                <span className={cn(isToday && 'font-medium text-primary')}>{relativeLabel(m.date)}</span>
              </div>
              {m.notes && <div className="mt-0.5 text-sm text-muted-foreground">{m.notes}</div>}
            </li>
          </React.Fragment>
        );
      })}
    </ol>
  );
};

export default MilestoneTimeline;
