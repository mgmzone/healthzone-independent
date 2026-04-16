import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Star, Trash2, Plus, Flag } from 'lucide-react';
import { useMilestones } from '@/hooks/useMilestones';
import { PeriodMilestone } from '@/lib/types';

interface MilestonesManagerProps {
  periodId: string | undefined;
  periodLabel?: string;
}

const MilestonesManager: React.FC<MilestonesManagerProps> = ({ periodId, periodLabel }) => {
  const { milestones, isLoading, addMilestone, updateMilestone, deleteMilestone, setPriority, clearPriority } =
    useMilestones(periodId);
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDate, setEditDate] = useState('');

  if (!periodId) {
    return (
      <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        Create an active period to add milestones.
      </div>
    );
  }

  const handleAdd = async () => {
    if (!newName.trim() || !newDate) return;
    const isFirst = milestones.length === 0;
    await addMilestone({
      name: newName.trim(),
      date: newDate,
      isPriority: isFirst, // auto-prioritize the first milestone
    });
    setNewName('');
    setNewDate('');
  };

  const startEdit = (m: PeriodMilestone) => {
    setEditingId(m.id);
    setEditName(m.name);
    setEditDate(m.date);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditDate('');
  };

  const saveEdit = async () => {
    if (!editingId || !editName.trim() || !editDate) return;
    await updateMilestone(editingId, { name: editName.trim(), date: editDate });
    cancelEdit();
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Flag className="h-5 w-5" /> Milestones
          {periodLabel && <span className="text-sm font-normal text-muted-foreground">· {periodLabel}</span>}
        </h3>
        <p className="text-sm text-muted-foreground">
          Track key dates within this period. Star one as priority to show its countdown on your dashboard.
        </p>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading milestones...</div>
      ) : milestones.length === 0 ? (
        <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
          No milestones yet.
        </div>
      ) : (
        <ul className="space-y-2">
          {milestones.map((m) => (
            <li
              key={m.id}
              className={`flex items-center gap-2 rounded-lg border p-3 ${
                m.isPriority ? 'border-amber-300 bg-amber-50/50' : ''
              }`}
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => (m.isPriority ? clearPriority() : setPriority(m.id))}
                title={m.isPriority ? 'Remove priority' : 'Make priority'}
              >
                <Star
                  className={`h-4 w-4 ${m.isPriority ? 'fill-amber-400 text-amber-500' : 'text-muted-foreground'}`}
                />
              </Button>

              {editingId === m.id ? (
                <div className="flex-1 grid grid-cols-[1fr_auto_auto_auto] gap-2">
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  <Input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-[160px]"
                  />
                  <Button type="button" size="sm" onClick={saveEdit}>
                    Save
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={cancelEdit}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{m.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(`${m.date}T12:00:00`).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => startEdit(m)}>
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMilestone(m.id)}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2 items-end pt-2 border-t">
        <div className="flex-1 space-y-1">
          <Label htmlFor="new-milestone-name" className="text-xs">
            Name
          </Label>
          <Input
            id="new-milestone-name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Surgery, Race day, Vacation..."
          />
        </div>
        <div className="w-[160px] space-y-1">
          <Label htmlFor="new-milestone-date" className="text-xs">
            Date
          </Label>
          <Input
            id="new-milestone-date"
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
          />
        </div>
        <Button type="button" onClick={handleAdd} disabled={!newName.trim() || !newDate}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>
    </div>
  );
};

export default MilestonesManager;
