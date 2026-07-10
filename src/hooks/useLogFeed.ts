import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMedicationLogs, deleteMedicationLog, updateMedicationLogTime } from '@/lib/services/medicationsService';
import { getTrackedEvents, deleteTrackedEvent, updateTrackedEventTime, getEventTypes } from '@/lib/services/trackingService';
import { getVitals, deleteVitals, updateVitalsTime } from '@/lib/services/vitalsService';
import { listJournalEntries } from '@/lib/services/journalService';
import { medSlotLabel } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { toLocalDateString } from '@/lib/utils/dateUtils';

export type LogSource = 'med' | 'tracker' | 'vital' | 'journal';
export type LogRange = 'today' | 'week';

export interface LogEntry {
  key: string;
  id: string;
  source: LogSource;
  at: Date;
  title: string;
  detail?: string;
  editableTime: boolean; // journal edits happen on the Journal page
}

function rangeBounds(range: LogRange): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const startDay = range === 'today' ? 0 : 6;
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - startDay, 0, 0, 0, 0);
  return { start, end };
}

function vitalsDetail(v: Awaited<ReturnType<typeof getVitals>>[number]): string {
  const parts: string[] = [];
  if (v.systolic != null && v.diastolic != null) parts.push(`BP ${v.systolic}/${v.diastolic}`);
  if (v.pulse != null) parts.push(`Pulse ${v.pulse}`);
  if (v.oxygenSaturation != null) parts.push(`O₂ ${v.oxygenSaturation}%`);
  if (v.temperature != null) parts.push(`${v.temperature}°${v.temperatureUnit}`);
  if (v.bloodGlucose != null) parts.push(`Glucose ${v.bloodGlucose}`);
  return parts.join(' · ') || 'Vitals';
}

export function useLogFeed(range: LogRange) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ['logFeed', range],
    queryFn: async (): Promise<LogEntry[]> => {
      const { start, end } = rangeBounds(range);
      const [medLogs, events, vitals, journal, eventTypes] = await Promise.all([
        getMedicationLogs(start, end),
        getTrackedEvents(start, end),
        getVitals(200),
        listJournalEntries({ dateFrom: toLocalDateString(start), dateTo: toLocalDateString(end) }),
        getEventTypes(true),
      ]);

      const labelByKey = new Map(eventTypes.map((t) => [t.key, t.label]));
      const entries: LogEntry[] = [];

      for (const l of medLogs) {
        entries.push({
          key: `med:${l.id}`, id: l.id, source: 'med', at: l.takenAt, editableTime: true,
          title: l.medicationName || 'Medication',
          detail: [l.slot ? medSlotLabel(l.slot) : null, l.status === 'skipped' ? 'skipped' : null].filter(Boolean).join(' · ') || undefined,
        });
      }
      for (const e of events) {
        const label = labelByKey.get(e.eventKey) || e.eventKey;
        entries.push({
          key: `tracker:${e.id}`, id: e.id, source: 'tracker', at: e.occurredAt, editableTime: true,
          title: label, detail: `+${e.quantity}${e.unit ? ` ${e.unit}` : ''}`,
        });
      }
      for (const v of vitals) {
        if (v.measuredAt >= start && v.measuredAt <= end) {
          entries.push({ key: `vital:${v.id}`, id: v.id, source: 'vital', at: v.measuredAt, editableTime: true, title: 'Vitals', detail: vitalsDetail(v) });
        }
      }
      for (const j of journal) {
        const at = new Date(`${j.entryDate}T${j.entryTime || '12:00:00'}`);
        entries.push({
          key: `journal:${j.id}`, id: j.id, source: 'journal', at, editableTime: false,
          title: j.title || 'Journal note',
          detail: j.body ? (j.body.length > 80 ? `${j.body.slice(0, 80)}…` : j.body) : undefined,
        });
      }

      return entries.sort((a, b) => b.at.getTime() - a.at.getTime());
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['logFeed'] });
    ['medicationLogs', 'trackedEvents', 'trackedEventTotals', 'vitals'].forEach((k) =>
      queryClient.invalidateQueries({ queryKey: [k] }));
  };

  const deleteEntry = useMutation({
    mutationFn: async (entry: LogEntry) => {
      if (entry.source === 'med') return deleteMedicationLog(entry.id);
      if (entry.source === 'tracker') return deleteTrackedEvent(entry.id);
      if (entry.source === 'vital') return deleteVitals(entry.id);
      // journal handled on the Journal page
    },
    onSuccess: () => { invalidate(); toast({ title: 'Entry removed' }); },
    onError: (e: Error) => toast({ title: 'Could not remove entry', description: e.message, variant: 'destructive' }),
  });

  const updateTime = useMutation({
    mutationFn: async ({ entry, at }: { entry: LogEntry; at: Date }) => {
      if (entry.source === 'med') return updateMedicationLogTime(entry.id, at);
      if (entry.source === 'tracker') return updateTrackedEventTime(entry.id, at);
      if (entry.source === 'vital') return updateVitalsTime(entry.id, at);
    },
    onSuccess: () => { invalidate(); toast({ title: 'Time updated' }); },
    onError: (e: Error) => toast({ title: 'Could not update time', description: e.message, variant: 'destructive' }),
  });

  return {
    entries: query.data ?? [],
    isLoading: query.isLoading,
    deleteEntry: (entry: LogEntry) => deleteEntry.mutate(entry),
    updateTime: (entry: LogEntry, at: Date) => updateTime.mutate({ entry, at }),
  };
}
