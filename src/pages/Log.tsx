import React, { useMemo, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Pill, Droplets, HeartPulse, BookOpen, Trash2, Clock, Check, X } from 'lucide-react';
import { useLogFeed, LogEntry, LogRange, LogSource } from '@/hooks/useLogFeed';
import { toLocalDateString } from '@/lib/utils/dateUtils';
import { cn } from '@/lib/utils';

const SOURCE_META: Record<LogSource, { icon: React.ElementType; className: string }> = {
  med: { icon: Pill, className: 'bg-violet-500/15 text-violet-500' },
  tracker: { icon: Droplets, className: 'bg-sky-500/15 text-sky-500' },
  vital: { icon: HeartPulse, className: 'bg-rose-500/15 text-rose-500' },
  journal: { icon: BookOpen, className: 'bg-amber-500/15 text-amber-500' },
};

// Date <-> datetime-local string (local time, no timezone suffix).
function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const LogRow: React.FC<{
  entry: LogEntry;
  onDelete: () => void;
  onUpdateTime: (at: Date) => void;
}> = ({ entry, onDelete, onUpdateTime }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(toLocalInput(entry.at));
  const { icon: Icon, className } = SOURCE_META[entry.source];

  const save = () => {
    const next = new Date(value);
    if (!isNaN(next.getTime())) onUpdateTime(next);
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-3 py-2.5">
      <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', className)}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{entry.title}</div>
        {entry.detail && <div className="truncate text-xs text-muted-foreground">{entry.detail}</div>}
      </div>

      {editing ? (
        <div className="flex items-center gap-1">
          <Input type="datetime-local" value={value} onChange={(e) => setValue(e.target.value)} className="h-8 w-[190px] text-xs" />
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={save} aria-label="Save time"><Check className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(false)} aria-label="Cancel"><X className="h-4 w-4" /></Button>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => entry.editableTime && setEditing(true)}
            className={cn('text-xs tabular-nums text-muted-foreground', entry.editableTime && 'hover:text-foreground')}
            title={entry.editableTime ? 'Edit time' : undefined}
          >
            {entry.at.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
            {entry.editableTime && <Clock className="ml-1 inline h-3 w-3" />}
          </button>
          {entry.source !== 'journal' && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={onDelete} aria-label="Delete entry">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

const Log: React.FC = () => {
  const [range, setRange] = useState<LogRange>('today');
  const { entries, isLoading, deleteEntry, updateTime } = useLogFeed(range);

  // Group by local day, newest first.
  const groups = useMemo(() => {
    const map = new Map<string, LogEntry[]>();
    for (const e of entries) {
      const k = toLocalDateString(e.at);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(e);
    }
    return Array.from(map.entries());
  }, [entries]);

  return (
    <Layout>
      <div className="container mx-auto max-w-3xl p-4 pt-24 pb-32">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Log</h1>
            <p className="text-sm text-muted-foreground">Everything you've logged, newest first.</p>
          </div>
          <div className="flex rounded-lg border p-0.5">
            {(['today', 'week'] as LogRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  'rounded-md px-3 py-1 text-sm transition-colors',
                  range === r ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {r === 'today' ? 'Today' : '7 days'}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : entries.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Nothing logged in this window yet.</p>
        ) : (
          <div className="space-y-4">
            {groups.map(([day, dayEntries]) => (
              <Card key={day}>
                <CardContent className="pt-4">
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {new Date(`${day}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                  </div>
                  <div className="divide-y">
                    {dayEntries.map((e) => (
                      <LogRow key={e.key} entry={e} onDelete={() => deleteEntry(e)} onUpdateTime={(at) => updateTime(e, at)} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Log;
