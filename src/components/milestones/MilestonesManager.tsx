import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Star, Trash2, Plus } from 'lucide-react';
import { useMilestones } from '@/hooks/useMilestones';
import { Milestone, MILESTONE_TYPES, milestoneTypeLabel } from '@/lib/types';

const emptyForm = { name: '', type: 'appointment', date: '', notes: '' };

const MilestonesManager: React.FC = () => {
  const { milestones, isLoading, addMilestone, updateMilestone, deleteMilestone, setPriority, clearPriority } =
    useMilestones();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const reset = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.date) return;
    if (editingId) {
      await updateMilestone(editingId, {
        name: form.name.trim(),
        type: form.type,
        date: form.date,
        notes: form.notes.trim() || undefined,
      });
    } else {
      await addMilestone({
        name: form.name.trim(),
        type: form.type,
        date: form.date,
        notes: form.notes.trim() || undefined,
        isPriority: milestones.length === 0, // auto-prioritize the very first
      });
    }
    reset();
  };

  const startEdit = (m: Milestone) => {
    setEditingId(m.id);
    setForm({ name: m.name, type: m.type, date: m.date, notes: m.notes ?? '' });
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading milestones…</div>
      ) : milestones.length === 0 ? (
        <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
          No milestones yet. Add surgery dates, appointments, follow-ups, and other key dates below.
        </div>
      ) : (
        <ul className="space-y-2">
          {milestones.map((m) => (
            <li
              key={m.id}
              className={`flex items-center gap-2 rounded-lg border p-3 ${
                m.isPriority ? 'border-amber-300 bg-amber-50/50 dark:bg-amber-950/20' : ''
              }`}
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => (m.isPriority ? clearPriority() : setPriority(m.id))}
                title={m.isPriority ? 'Remove priority' : 'Make priority (shown on dashboard)'}
              >
                <Star className={`h-4 w-4 ${m.isPriority ? 'fill-amber-400 text-amber-500' : 'text-muted-foreground'}`} />
              </Button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{m.name}</span>
                  <Badge variant="secondary" className="shrink-0 text-xs">{milestoneTypeLabel(m.type)}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(`${m.date}T12:00:00`).toLocaleDateString(undefined, {
                    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
                  })}
                  {m.notes ? ` · ${m.notes}` : ''}
                </div>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => startEdit(m)}>Edit</Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => deleteMilestone(m.id)} title="Delete">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {/* Add / edit form */}
      <div className="space-y-3 rounded-lg border p-3">
        <div className="text-sm font-medium">{editingId ? 'Edit milestone' : 'Add a milestone'}</div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="ms-name">Name</Label>
            <Input id="ms-name" value={form.name} onChange={(e) => set('name')(e.target.value)} placeholder="Cystoscopy, stoma-nurse visit…" />
          </div>
          <div>
            <Label htmlFor="ms-type">Type</Label>
            <Select value={form.type} onValueChange={set('type')}>
              <SelectTrigger id="ms-type"><SelectValue /></SelectTrigger>
              <SelectContent>
                {MILESTONE_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="ms-date">Date</Label>
            <Input id="ms-date" type="date" value={form.date} onChange={(e) => set('date')(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="ms-notes">Notes (optional)</Label>
            <Textarea id="ms-notes" rows={2} value={form.notes} onChange={(e) => set('notes')(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          {editingId && <Button variant="ghost" size="sm" onClick={reset}>Cancel</Button>}
          <Button size="sm" onClick={handleSubmit} disabled={!form.name.trim() || !form.date}>
            {editingId ? 'Save changes' : <><Plus className="mr-1 h-4 w-4" /> Add</>}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MilestonesManager;
