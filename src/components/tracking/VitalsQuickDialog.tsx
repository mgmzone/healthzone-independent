import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { HeartPulse } from 'lucide-react';
import { addVitals } from '@/lib/services/vitalsService';
import { Vitals } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { localNoon, isLocalToday } from '@/lib/utils/dateUtils';

const numOrUndef = (v: string): number | undefined => {
  if (v.trim() === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

// Compact vital-signs entry. All fields optional — log whatever was measured.
// Pass a past `date` to backfill that day (reading is timestamped at local noon).
const VitalsQuickDialog: React.FC<{ date?: Date }> = ({ date }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    systolic: '',
    diastolic: '',
    pulse: '',
    oxygenSaturation: '',
    temperature: '',
    temperatureUnit: 'F' as 'F' | 'C',
    notes: '',
  });

  const reset = () =>
    setForm({ systolic: '', diastolic: '', pulse: '', oxygenSaturation: '', temperature: '', temperatureUnit: 'F', notes: '' });

  const save = useMutation({
    mutationFn: () => {
      const payload: Partial<Vitals> = {
        systolic: numOrUndef(form.systolic),
        diastolic: numOrUndef(form.diastolic),
        pulse: numOrUndef(form.pulse),
        oxygenSaturation: numOrUndef(form.oxygenSaturation),
        temperature: numOrUndef(form.temperature),
        temperatureUnit: form.temperatureUnit,
        notes: form.notes.trim() || undefined,
        measuredAt: date && !isLocalToday(date) ? localNoon(date) : undefined,
      };
      return addVitals(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vitals'] });
      toast({ title: 'Vitals recorded' });
      reset();
      setOpen(false);
    },
    onError: (e: Error) => toast({ title: 'Could not save vitals', description: e.message, variant: 'destructive' }),
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <HeartPulse className="mr-2 h-4 w-4" /> Log vitals
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record vitals</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="sys">Systolic</Label>
            <Input id="sys" inputMode="numeric" value={form.systolic} onChange={set('systolic')} placeholder="120" />
          </div>
          <div>
            <Label htmlFor="dia">Diastolic</Label>
            <Input id="dia" inputMode="numeric" value={form.diastolic} onChange={set('diastolic')} placeholder="80" />
          </div>
          <div>
            <Label htmlFor="pulse">Pulse (bpm)</Label>
            <Input id="pulse" inputMode="numeric" value={form.pulse} onChange={set('pulse')} placeholder="72" />
          </div>
          <div>
            <Label htmlFor="spo2">O₂ sat (%)</Label>
            <Input id="spo2" inputMode="numeric" value={form.oxygenSaturation} onChange={set('oxygenSaturation')} placeholder="98" />
          </div>
          <div>
            <Label htmlFor="temp">Temp (°{form.temperatureUnit})</Label>
            <Input id="temp" inputMode="decimal" value={form.temperature} onChange={set('temperature')} placeholder="98.6" />
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setForm((f) => ({ ...f, temperatureUnit: f.temperatureUnit === 'F' ? 'C' : 'F' }))}
            >
              Switch to °{form.temperatureUnit === 'F' ? 'C' : 'F'}
            </Button>
          </div>
        </div>
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" value={form.notes} onChange={set('notes')} rows={2} placeholder="Optional" />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VitalsQuickDialog;
