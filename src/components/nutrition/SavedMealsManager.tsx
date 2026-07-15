import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Plus, Trash2, Pencil, Star, Leaf } from 'lucide-react';
import { SavedMeal } from '@/lib/types';
import { useSavedMeals } from '@/hooks/useSavedMeals';

const emptyForm = {
  name: '',
  description: '',
  proteinGrams: '',
  carbsGrams: '',
  fatGrams: '',
  sodiumMg: '',
  calories: '',
  antiInflammatory: false,
};

const parseOptional = (v: string): number | undefined => {
  if (!v) return undefined;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : undefined;
};

// Manage saved meal favorites: the presets offered in the Log Meal form.
const SavedMealsManager: React.FC = () => {
  const { savedMeals, saveMeal, updateMeal, deleteMeal } = useSavedMeals();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const reset = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const startEdit = (meal: SavedMeal) => {
    setEditingId(meal.id);
    setForm({
      name: meal.name,
      description: meal.description || '',
      proteinGrams: meal.proteinGrams?.toString() || '',
      carbsGrams: meal.carbsGrams?.toString() || '',
      fatGrams: meal.fatGrams?.toString() || '',
      sodiumMg: meal.sodiumMg?.toString() || '',
      calories: meal.calories?.toString() || '',
      antiInflammatory: meal.antiInflammatory,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    const input = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      proteinGrams: parseOptional(form.proteinGrams),
      carbsGrams: parseOptional(form.carbsGrams),
      fatGrams: parseOptional(form.fatGrams),
      sodiumMg: parseOptional(form.sodiumMg),
      calories: parseOptional(form.calories),
      antiInflammatory: form.antiInflammatory,
    };
    if (editingId) {
      await updateMeal(editingId, input);
    } else {
      await saveMeal(input);
    }
    reset();
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteMeal(deleteId);
      setDeleteId(null);
    }
  };

  const set = (k: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const macroSummary = (m: SavedMeal): string => {
    const parts: string[] = [];
    if (m.proteinGrams != null) parts.push(`${m.proteinGrams}g protein`);
    if (m.calories != null) parts.push(`${m.calories} cal`);
    if (m.carbsGrams != null) parts.push(`${m.carbsGrams}g carbs`);
    if (m.fatGrams != null) parts.push(`${m.fatGrams}g fat`);
    return parts.join(' · ');
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" /> Saved Meals
            </CardTitle>
            <Button size="sm" onClick={() => { reset(); setShowForm(true); }}>
              <Plus className="h-4 w-4 mr-1" /> Add Meal
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Meals you eat often — pick one in the Log Meal form to fill in the description and macros.
            You can also save any meal as a favorite while logging it.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {showForm && (
            <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={set('name')}
                  placeholder='e.g. "Boost Shake (Vanilla, 11oz)"'
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={set('description')}
                  placeholder="e.g. 2 fried eggs, 1 slice Ezekiel toast, 12oz decaf with half & half"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Protein (g)</Label>
                  <Input type="number" step="0.1" min="0" value={form.proteinGrams} onChange={set('proteinGrams')} />
                </div>
                <div className="space-y-2">
                  <Label>Calories</Label>
                  <Input type="number" step="1" min="0" value={form.calories} onChange={set('calories')} />
                </div>
                <div className="space-y-2">
                  <Label>Carbs (g)</Label>
                  <Input type="number" step="0.1" min="0" value={form.carbsGrams} onChange={set('carbsGrams')} />
                </div>
                <div className="space-y-2">
                  <Label>Fat (g)</Label>
                  <Input type="number" step="0.1" min="0" value={form.fatGrams} onChange={set('fatGrams')} />
                </div>
                <div className="space-y-2">
                  <Label>Sodium (mg)</Label>
                  <Input type="number" step="1" min="0" value={form.sodiumMg} onChange={set('sodiumMg')} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="saved-meal-anti-inflammatory"
                  checked={form.antiInflammatory}
                  onCheckedChange={(checked) => setForm((f) => ({ ...f, antiInflammatory: checked === true }))}
                />
                <Label htmlFor="saved-meal-anti-inflammatory" className="text-sm cursor-pointer">
                  Anti-inflammatory foods
                </Label>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave} disabled={!form.name.trim()}>
                  {editingId ? 'Update' : 'Save'}
                </Button>
                <Button size="sm" variant="outline" onClick={reset}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {savedMeals.length === 0 && !showForm ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              No saved meals yet. Add your regulars here, or check "Save as favorite" when logging a meal.
            </p>
          ) : (
            <div className="grid gap-2">
              {savedMeals.map((meal) => (
                <div
                  key={meal.id}
                  className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg border"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{meal.name}</span>
                      {meal.antiInflammatory && <Leaf className="h-4 w-4 shrink-0 text-green-500" />}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {macroSummary(meal) || meal.description || '—'}
                      {meal.timesUsed > 0 && ` · used ${meal.timesUsed}×`}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => startEdit(meal)}
                      aria-label={`Edit ${meal.name}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500 hover:text-red-600"
                      onClick={() => setDeleteId(meal.id)}
                      aria-label={`Remove ${meal.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this saved meal?</AlertDialogTitle>
            <AlertDialogDescription>
              This won't affect meals you've already logged with it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SavedMealsManager;
