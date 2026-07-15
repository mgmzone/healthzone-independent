import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Medication, MedicationLog, DailyGoal, DailyGoalEntry, MED_SLOTS } from '@/lib/types';
import { getMedications, getMedicationLogs, logMedication, deleteMedicationLog } from '@/lib/services/medicationsService';
import { getDailyGoals, getDailyGoalEntries, upsertDailyGoalEntry } from '@/lib/services/dailyGoalsService';
import { getVitals } from '@/lib/services/vitalsService';
import { useToast } from '@/hooks/use-toast';
import { toLocalDateString, localDayRange, localNoon, isLocalToday } from '@/lib/utils/dateUtils';

export interface MedDoseItem {
  med: Medication;
  slot: string;
  taken: boolean;
  logId?: string;
}

export interface PrnItem {
  med: Medication;
  takenCount: number;
  lastTakenAt?: Date;
  canTake: boolean;
  blockReason?: string;
}

export interface CheckItem {
  goal: DailyGoal;
  met: boolean;
  entryId?: string;
}

export interface SlotGroup {
  slot: string;
  label: string;
  items: MedDoseItem[];
}

// Composes the day's scheduled med doses (grouped by time of day), PRN meds with
// safety math, and the binary daily checks (vitamins, Boost, yogurt…) into one
// checklist. Tally trackers and vitals are handled by their own hooks/dialogs.
// Defaults to today; pass a past date to view/backfill that day (entries are
// timestamped at local noon so they can't drift into an adjacent day).
export function useTodayChecklist(date: Date = new Date()) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const dateStr = toLocalDateString(date);
  const isToday = isLocalToday(date);
  const entryTime = () => (isToday ? new Date() : localNoon(date));

  const { data: meds = [], isLoading: medsLoading } = useQuery({
    queryKey: ['medications'],
    queryFn: () => getMedications(false),
  });
  const { data: medLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['medicationLogs', dateStr],
    queryFn: () => { const { start, end } = localDayRange(date); return getMedicationLogs(start, end); },
  });
  const { data: goals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ['dailyGoals'],
    queryFn: getDailyGoals,
  });
  const { data: goalEntries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ['dailyGoalEntries', dateStr],
    queryFn: () => getDailyGoalEntries(dateStr, dateStr),
  });
  const { data: vitalsList = [] } = useQuery({
    queryKey: ['vitals'],
    queryFn: () => getVitals(50),
  });

  const scheduled = meds.filter((m) => !m.isPrn && m.slots.length > 0);
  const prn = meds.filter((m) => m.isPrn);

  const takenLog = (medId: string, slot: string): MedicationLog | undefined =>
    medLogs.find((l) => l.medicationId === medId && l.slot === slot && l.status === 'taken');

  const slotGroups: SlotGroup[] = MED_SLOTS.map(({ value, label }) => ({
    slot: value,
    label,
    items: scheduled
      .filter((m) => m.slots.includes(value))
      .map((m) => {
        const log = takenLog(m.id, value);
        return { med: m, slot: value, taken: !!log, logId: log?.id };
      }),
  })).filter((g) => g.items.length > 0);

  const prnItems: PrnItem[] = prn.map((m) => {
    const logs = medLogs
      .filter((l) => l.medicationId === m.id && l.status === 'taken')
      .sort((a, b) => b.takenAt.getTime() - a.takenAt.getTime());
    const takenCount = logs.length;
    const lastTakenAt = logs[0]?.takenAt;
    let canTake = true;
    let blockReason: string | undefined;
    if (m.maxPerDay != null && takenCount >= m.maxPerDay) {
      canTake = false;
      blockReason = `Daily max (${m.maxPerDay}) reached`;
    } else if (isToday && m.minHoursBetween != null && lastTakenAt) {
      // Spacing check only applies live — backfilled doses land at noon.
      const hoursSince = (Date.now() - lastTakenAt.getTime()) / 3_600_000;
      if (hoursSince < m.minHoursBetween) {
        canTake = false;
        const wait = Math.ceil(m.minHoursBetween - hoursSince);
        blockReason = `Wait ~${wait}h (min ${m.minHoursBetween}h apart)`;
      }
    }
    return { med: m, takenCount, lastTakenAt, canTake, blockReason };
  });

  const checks: CheckItem[] = goals.map((goal) => {
    const entry = goalEntries.find((e: DailyGoalEntry) => e.goalId === goal.id);
    return { goal, met: entry?.met ?? false, entryId: entry?.id };
  });

  const vitalsLogged = vitalsList.some((v) => toLocalDateString(v.measuredAt) === dateStr);

  // Progress across checkable items (scheduled doses + binary checks).
  const doseTotal = slotGroups.reduce((n, g) => n + g.items.length, 0);
  const doseDone = slotGroups.reduce((n, g) => n + g.items.filter((i) => i.taken).length, 0);
  const checkDone = checks.filter((c) => c.met).length;
  const done = doseDone + checkDone;
  const total = doseTotal + checks.length;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['medicationLogs', dateStr] });
    queryClient.invalidateQueries({ queryKey: ['dailyGoalEntries', dateStr] });
  };

  const toggleDose = useMutation({
    mutationFn: async (item: MedDoseItem) => {
      if (item.taken && item.logId) {
        await deleteMedicationLog(item.logId);
      } else {
        await logMedication({ medication: item.med, slot: item.slot, takenAt: entryTime() });
      }
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast({ title: 'Could not update dose', description: e.message, variant: 'destructive' }),
  });

  const takePrn = useMutation({
    mutationFn: (med: Medication) => logMedication({ medication: med, slot: 'prn', takenAt: entryTime() }),
    onSuccess: (_d, med) => { invalidate(); toast({ title: `Logged ${med.name}` }); },
    onError: (e: Error) => toast({ title: 'Could not log dose', description: e.message, variant: 'destructive' }),
  });

  const toggleCheck = useMutation({
    mutationFn: (item: CheckItem) =>
      upsertDailyGoalEntry({ goalId: item.goal.id, date, met: !item.met }),
    onSuccess: invalidate,
    onError: (e: Error) => toast({ title: 'Could not update', description: e.message, variant: 'destructive' }),
  });

  return {
    slotGroups,
    prnItems,
    checks,
    vitalsLogged,
    progress: { done, total },
    isLoading: medsLoading || logsLoading || goalsLoading || entriesLoading,
    toggleDose: (item: MedDoseItem) => toggleDose.mutate(item),
    takePrn: (med: Medication) => takePrn.mutate(med),
    toggleCheck: (item: CheckItem) => toggleCheck.mutate(item),
  };
}
