import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMedications, getMedicationLogs, logMedication } from '@/lib/services/medicationsService';
import { Medication } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Check, Pill } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

function todayRange(): { start: Date; end: Date } {
  const now = new Date();
  return {
    start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0),
    end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999),
  };
}

const MedsChecklist: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: meds = [] } = useQuery({
    queryKey: ['medications'],
    queryFn: () => getMedications(false),
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['medicationLogs', 'today'],
    queryFn: () => {
      const { start, end } = todayRange();
      return getMedicationLogs(start, end);
    },
  });

  const takenCountFor = (medId: string) =>
    logs.filter((l) => l.medicationId === medId && l.status === 'taken').length;

  const takeDose = useMutation({
    mutationFn: (med: Medication) => logMedication({ medication: med, status: 'taken' }),
    onSuccess: (_d, med) => {
      queryClient.invalidateQueries({ queryKey: ['medicationLogs', 'today'] });
      toast({ title: `Logged ${med.name}` });
    },
    onError: (e: Error) => toast({ title: 'Could not log dose', description: e.message, variant: 'destructive' }),
  });

  if (meds.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No medications yet. Add them in the medication manager to track daily doses.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {meds.map((med) => {
        const taken = takenCountFor(med.id);
        const target = med.timesPerDay ?? null;
        const complete = target != null && taken >= target;
        return (
          <li
            key={med.id}
            className={cn(
              'flex items-center justify-between rounded-lg border bg-card p-3',
              complete && 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20'
            )}
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'inline-flex h-8 w-8 items-center justify-center rounded-full',
                  complete ? 'bg-emerald-500/15 text-emerald-600' : 'bg-primary/10 text-primary'
                )}
              >
                {complete ? <Check className="h-4 w-4" /> : <Pill className="h-4 w-4" />}
              </span>
              <div>
                <div className="text-sm font-medium">{med.name}</div>
                <div className="text-xs text-muted-foreground">
                  {med.dose ? `${med.dose} · ` : ''}
                  {target != null ? `${taken} of ${target} today` : taken > 0 ? `${taken} taken today` : (med.schedule || 'as needed')}
                </div>
              </div>
            </div>
            <Button size="sm" variant={complete ? 'outline' : 'default'} onClick={() => takeDose.mutate(med)}>
              Take
            </Button>
          </li>
        );
      })}
    </ul>
  );
};

export default MedsChecklist;
