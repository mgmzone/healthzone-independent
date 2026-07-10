import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Pill, Trash2, Pencil, Plus } from 'lucide-react';
import { Medication, MED_SLOTS, medSlotLabel } from '@/lib/types';
import { getMedications, addMedication, updateMedication, deleteMedication } from '@/lib/services/medicationsService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type FormState = {
  name: string;
  dose: string;
  slots: string[];
  isPrn: boolean;
  maxPerDay: string;
  minHoursBetween: string;
  schedule: string;
};

const emptyForm: FormState = {
  name: '', dose: '', slots: [], isPrn: false, maxPerDay: '', minHoursBetween: '', schedule: '',
};

// Human summary of a med's schedule for the list rows.
function scheduleSummary(m: Medication): string {
  if (m.isPrn) {
    const bits = ['as needed'];
    if (m.maxPerDay) bits.push(`max ${m.maxPerDay}/day`);
    if (m.minHoursBetween) bits.push(`≥${m.minHoursBetween}h apart`);
    return bits.join(' · ');
  }
  if (m.slots.length) return m.slots.map(medSlotLabel).join(', ');
  return m.schedule || 'no schedule';
}

const MedicationManagerDialog: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const { data: meds = [] } = useQuery({
    queryKey: ['medications', 'all'],
    queryFn: () => getMedications(true),
    enabled: open,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['medications'] });

  const reset = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const toggleSlot = (slot: string) =>
    setForm((f) => ({
      ...f,
      slots: f.slots.includes(slot) ? f.slots.filter((s) => s !== slot) : [...f.slots, slot],
    }));

  const save = useMutation({
    mutationFn: () => {
      const payload: Partial<Medication> = {
        name: form.name.trim(),
        dose: form.dose.trim() || undefined,
        schedule: form.schedule.trim() || undefined,
        isPrn: form.isPrn,
        slots: form.isPrn ? [] : form.slots,
        maxPerDay: form.isPrn && form.maxPerDay.trim() ? Number(form.maxPerDay) : undefined,
        minHoursBetween: form.isPrn && form.minHoursBetween.trim() ? Number(form.minHoursBetween) : undefined,
      };
      return editingId ? updateMedication(editingId, payload) : addMedication(payload);
    },
    onSuccess: () => {
      invalidate();
      toast({ title: editingId ? 'Medication updated' : 'Medication added' });
      reset();
    },
    onError: (e: Error) => toast({ title: 'Could not save medication', description: e.message, variant: 'destructive' }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteMedication(id),
    onSuccess: () => {
      invalidate();
      toast({ title: 'Medication removed' });
      if (editingId) reset();
    },
    onError: (e: Error) => toast({ title: 'Could not remove medication', description: e.message, variant: 'destructive' }),
  });

  const startEdit = (m: Medication) => {
    setEditingId(m.id);
    setForm({
      name: m.name,
      dose: m.dose ?? '',
      slots: m.slots ?? [],
      isPrn: m.isPrn,
      maxPerDay: m.maxPerDay != null ? String(m.maxPerDay) : '',
      minHoursBetween: m.minHoursBetween != null ? String(m.minHoursBetween) : '',
      schedule: m.schedule ?? '',
    });
  };

  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Pill className="mr-2 h-4 w-4" /> Manage
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage medications</DialogTitle>
        </DialogHeader>

        <ul className="max-h-52 space-y-1 overflow-y-auto">
          {meds.map((m) => (
            <li key={m.id} className="flex items-center justify-between rounded-lg border p-2">
              <div>
                <div className="text-sm font-medium">{m.name}</div>
                <div className="text-xs text-muted-foreground">
                  {m.dose ? `${m.dose} · ` : ''}{scheduleSummary(m)}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(m)} aria-label={`Edit ${m.name}`}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-red-500 hover:text-red-700"
                  onClick={() => remove.mutate(m.id)}
                  aria-label={`Delete ${m.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>

        <div className="space-y-3 rounded-lg border p-3">
          <div className="text-sm font-medium">{editingId ? 'Edit medication' : 'Add a medication'}</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label htmlFor="md-name">Name</Label>
              <Input id="md-name" value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="e.g. Amlodipine" />
            </div>
            <div className="col-span-2">
              <Label htmlFor="md-dose">Dose</Label>
              <Input id="md-dose" value={form.dose} onChange={(e) => setField('dose', e.target.value)} placeholder="10/40 mg, 1 capsule…" />
            </div>
          </div>

          {/* Schedule: either time-of-day slots or as-needed */}
          <div className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2">
            <Label htmlFor="md-prn" className="text-sm">As needed (PRN)</Label>
            <Switch id="md-prn" checked={form.isPrn} onCheckedChange={(v) => setField('isPrn', v)} />
          </div>

          {form.isPrn ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="md-max">Max per day</Label>
                <Input id="md-max" inputMode="numeric" value={form.maxPerDay} onChange={(e) => setField('maxPerDay', e.target.value)} placeholder="e.g. 10" />
              </div>
              <div>
                <Label htmlFor="md-hours">Min hours apart</Label>
                <Input id="md-hours" inputMode="numeric" value={form.minHoursBetween} onChange={(e) => setField('minHoursBetween', e.target.value)} placeholder="e.g. 6" />
              </div>
            </div>
          ) : (
            <div>
              <Label className="mb-1.5 block">Times of day</Label>
              <div className="flex flex-wrap gap-2">
                {MED_SLOTS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => toggleSlot(s.value)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-sm transition-colors',
                      form.slots.includes(s.value)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:border-primary/50',
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            {editingId && <Button variant="ghost" size="sm" onClick={reset}>Cancel</Button>}
            <Button size="sm" onClick={() => save.mutate()} disabled={!form.name.trim() || save.isPending}>
              {editingId ? 'Save changes' : <><Plus className="mr-1 h-4 w-4" /> Add</>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MedicationManagerDialog;
