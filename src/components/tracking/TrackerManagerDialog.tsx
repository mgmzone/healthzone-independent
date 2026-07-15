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
import { Settings2, Trash2, Pencil, Plus } from 'lucide-react';
import { EventType } from '@/lib/types';
import { getEventTypes, addEventType, updateEventType, deleteEventType } from '@/lib/services/trackingService';
import { resolveTrackerIcon, isEmojiIcon } from './trackerIcons';
import { useToast } from '@/hooks/use-toast';

const emptyForm = { label: '', icon: '', unit: '', defaultQuantity: '1', dailyTarget: '' };

const TrackerManagerDialog: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: trackers = [] } = useQuery({
    queryKey: ['eventTypes', 'all'],
    queryFn: () => getEventTypes(true),
    enabled: open,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['eventTypes'] });
    queryClient.invalidateQueries({ queryKey: ['trackedEvents'] });
  };

  const reset = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const save = useMutation({
    mutationFn: () => {
      const payload: Partial<EventType> = {
        label: form.label.trim(),
        icon: form.icon.trim() || undefined,
        unit: form.unit.trim() || undefined,
        defaultQuantity: Number(form.defaultQuantity) || 1,
        dailyTarget: form.dailyTarget.trim() === '' ? undefined : Number(form.dailyTarget),
      };
      return editingId ? updateEventType(editingId, payload) : addEventType(payload);
    },
    onSuccess: () => {
      invalidate();
      toast({ title: editingId ? 'Tracker updated' : 'Tracker added' });
      reset();
    },
    onError: (e: Error) => toast({ title: 'Could not save tracker', description: e.message, variant: 'destructive' }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteEventType(id),
    onSuccess: () => {
      invalidate();
      toast({ title: 'Tracker removed' });
      if (editingId) reset();
    },
    onError: (e: Error) => toast({ title: 'Could not remove tracker', description: e.message, variant: 'destructive' }),
  });

  const startEdit = (t: EventType) => {
    setEditingId(t.id);
    setForm({
      label: t.label,
      icon: t.icon ?? '',
      unit: t.unit ?? '',
      defaultQuantity: String(t.defaultQuantity),
      dailyTarget: t.dailyTarget != null ? String(t.dailyTarget) : '',
    });
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Settings2 className="mr-2 h-4 w-4" /> Manage
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage trackers</DialogTitle>
        </DialogHeader>

        {/* Existing trackers */}
        <ul className="max-h-56 space-y-1 overflow-y-auto">
          {trackers.map((t) => {
            const Icon = resolveTrackerIcon(t.icon);
            const emoji = isEmojiIcon(t.icon) ? t.icon : null;
            return (
              <li key={t.id} className="flex items-center justify-between rounded-lg border p-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {emoji ? <span className="text-base leading-none">{emoji}</span> : <Icon className="h-4 w-4" />}
                  </span>
                  <div>
                    <div className="text-sm font-medium">{t.label}</div>
                    <div className="text-xs text-muted-foreground">
                      +{t.defaultQuantity}{t.unit ? ` ${t.unit}` : ''}
                      {t.dailyTarget != null ? ` · target ${t.dailyTarget}` : ''}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(t)} aria-label={`Edit ${t.label}`}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-500 hover:text-red-700"
                    onClick={() => remove.mutate(t.id)}
                    aria-label={`Delete ${t.label}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Add / edit form */}
        <div className="space-y-3 rounded-lg border p-3">
          <div className="text-sm font-medium">{editingId ? 'Edit tracker' : 'Add a tracker'}</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label htmlFor="tk-label">Name</Label>
              <Input id="tk-label" value={form.label} onChange={set('label')} placeholder="e.g. Walk" />
            </div>
            <div>
              <Label htmlFor="tk-icon">Icon (emoji or name)</Label>
              <Input id="tk-icon" value={form.icon} onChange={set('icon')} placeholder="🚶 or Footprints" />
            </div>
            <div>
              <Label htmlFor="tk-unit">Unit (optional)</Label>
              <Input id="tk-unit" value={form.unit} onChange={set('unit')} placeholder="oz, min…" />
            </div>
            <div>
              <Label htmlFor="tk-qty">Amount per tap</Label>
              <Input id="tk-qty" inputMode="decimal" value={form.defaultQuantity} onChange={set('defaultQuantity')} placeholder="1" />
            </div>
            <div>
              <Label htmlFor="tk-target">Daily target (optional)</Label>
              <Input id="tk-target" inputMode="decimal" value={form.dailyTarget} onChange={set('dailyTarget')} placeholder="e.g. 64" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            {editingId && (
              <Button variant="ghost" size="sm" onClick={reset}>Cancel</Button>
            )}
            <Button size="sm" onClick={() => save.mutate()} disabled={!form.label.trim() || save.isPending}>
              {editingId ? 'Save changes' : <><Plus className="mr-1 h-4 w-4" /> Add</>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrackerManagerDialog;
