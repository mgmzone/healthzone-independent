import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Trash2 } from 'lucide-react';
import { DailyGoal, GoalCategory, GOAL_CATEGORIES } from '@/lib/types';

interface GoalManagerProps {
  goals: DailyGoal[];
  onAdd: (data: Partial<DailyGoal>) => Promise<any>;
  onUpdate: (id: string, data: Partial<DailyGoal>) => Promise<any>;
  onDelete: (id: string) => Promise<any>;
}

const CATEGORY_LABELS: Record<GoalCategory, string> = {
  dietary: 'Dietary',
  hydration: 'Hydration',
  supplement: 'Supplement',
  lifestyle: 'Lifestyle',
};

const GoalManager: React.FC<GoalManagerProps> = ({
  goals,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<GoalCategory>('dietary');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await onAdd({
      name: newName.trim(),
      description: newDescription.trim() || undefined,
      category: newCategory,
      sortOrder: goals.length,
    });
    setNewName('');
    setNewDescription('');
    setNewCategory('dietary');
    setShowAddForm(false);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await onDelete(deleteId);
      setDeleteId(null);
    }
  };

  const handleToggleActive = async (goal: DailyGoal) => {
    await onUpdate(goal.id, { isActive: !goal.isActive });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Manage Goals</CardTitle>
            <Button size="sm" onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Goal
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {showAddForm && (
            <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
              <div className="space-y-2">
                <Label>Goal Name</Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. No added sugar"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Input
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="e.g. No processed foods with added sugar"
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={newCategory} onValueChange={(v) => setNewCategory(v as GoalCategory)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GOAL_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{CATEGORY_LABELS[cat]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAdd} disabled={!newName.trim()}>
                  Save Goal
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {goals.length === 0 && !showAddForm ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              No goals yet. Click "Add Goal" to create your first daily goal.
            </p>
          ) : (
            goals.map(goal => (
              <div
                key={goal.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg border"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={!goal.isActive ? 'text-muted-foreground' : ''}>
                        {goal.name}
                      </span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {goal.category}
                      </Badge>
                      {!goal.isActive && (
                        <Badge variant="secondary" className="text-xs">Paused</Badge>
                      )}
                    </div>
                    {goal.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{goal.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={goal.isActive}
                    onCheckedChange={() => handleToggleActive(goal)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-500 hover:text-red-600"
                    onClick={() => setDeleteId(goal.id)}
                    aria-label={`Delete ${goal.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this goal?</AlertDialogTitle>
            <AlertDialogDescription>
              This will also delete all check-in history for this goal. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default GoalManager;
