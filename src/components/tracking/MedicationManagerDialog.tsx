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
import { Pill, Trash2, Pencil, Plus } from 'lucide-react';
import { Medication } from '@/lib/types';
import { getMedications, addMedication, updateMedication, deleteMedication } from '@/lib/services/medicationsService';
import { useToast } from '@/hooks/use-toast';

const emptyForm = { name: '', dose: '', schedule: '', timesPerDay: '' };

const MedicationManagerDialog: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

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

  const save = useMutation({
    mutationFn: () => {
      const payload: Partial<Medication> = {
        name: form.name.trim(),
        dose: form.dose.trim() || undefined,
        schedule: form.schedule.trim() || undefined,
        timesPerDay: form.timesPerDay.trim() === '' ? undefined : Number(form.timesPerDay),
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
      schedule: m.schedule ?? '',
      timesPerDay: m.timesPerDay != null ? String(m.timesPerDay) : '',
    });
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

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

        <ul className="max-h-56 space-y-1 overflow-y-auto">
          {meds.map((m) => (
            <li key={m.id} className="flex items-center justify-between rounded-lg border p-2">
              <div>
                <div className="text-sm font-medium">{m.name}</div>
                <div className="text-xs text-muted-foreground">
                  {m.dose ? `${m.dose} · ` : ''}
                  {m.timesPerDay != null ? `${m.timesPerDay}×/day` : m.schedule || 'as needed'}
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
              <Input id="md-name" value={form.name} onChange={set('name')} placeholder="e.g. Oxybutynin" />
            </div>
            <div>
              <Label htmlFor="md-dose">Dose</Label>
              <Input id="md-dose" value={form.dose} onChange={set('dose')} placeholder="5 mg" />
            </div>
            <div>
              <Label htmlFor="md-times">Times per day</Label>
              <Input id="md-times" inputMode="numeric" value={form.timesPerDay} onChange={set('timesPerDay')} placeholder="2 (blank = as needed)" />
            </div>
            <div className="col-span-2">
              <Label htmlFor="md-schedule">Schedule / notes</Label>
              <Input id="md-schedule" value={form.schedule} onChange={set('schedule')} placeholder="e.g. morning and night" />
            </div>
          </div>
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
