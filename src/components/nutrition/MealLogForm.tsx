import React, { useState, FormEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MealLog, MealSlot, MEAL_SLOT_LABELS, ProteinSource } from '@/lib/types';
import DatePickerField from '@/components/weight/DatePickerField';

interface MealLogFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<MealLog>) => Promise<any>;
  proteinSources: ProteinSource[];
  initialData?: MealLog;
}

const MealLogForm: React.FC<MealLogFormProps> = ({
  isOpen,
  onClose,
  onSave,
  proteinSources,
  initialData,
}) => {
  const [date, setDate] = useState<Date>(initialData?.date || new Date());
  const [mealSlot, setMealSlot] = useState<MealSlot>(initialData?.mealSlot || 'noon');
  const [proteinGrams, setProteinGrams] = useState<string>(
    initialData?.proteinGrams?.toString() || ''
  );
  const [proteinSource, setProteinSource] = useState(initialData?.proteinSource || '');
  const [irritantViolation, setIrritantViolation] = useState(initialData?.irritantViolation || false);
  const [irritantNotes, setIrritantNotes] = useState(initialData?.irritantNotes || '');
  const [antiInflammatory, setAntiInflammatory] = useState(initialData?.antiInflammatory || false);
  const [notes, setNotes] = useState(initialData?.notes || '');

  const handleProteinSourceSelect = (sourceId: string) => {
    const source = proteinSources.find(s => s.id === sourceId);
    if (source) {
      setProteinSource(source.name);
      if (source.typicalProteinGrams) {
        setProteinGrams(source.typicalProteinGrams.toString());
      }
      if (source.isAntiInflammatory) {
        setAntiInflammatory(true);
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSave({
      date,
      mealSlot,
      proteinGrams: proteinGrams ? parseFloat(proteinGrams) : undefined,
      proteinSource: proteinSource || undefined,
      irritantViolation,
      irritantNotes: irritantViolation ? irritantNotes : undefined,
      antiInflammatory,
      notes: notes || undefined,
    });
    // Reset form before closing to avoid state updates on unmounted component
    setProteinGrams('');
    setProteinSource('');
    setIrritantViolation(false);
    setIrritantNotes('');
    setAntiInflammatory(false);
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Meal' : 'Log Meal'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <DatePickerField date={date} onChange={setDate} />
            </div>
            <div className="space-y-2">
              <Label>Meal Slot</Label>
              <Select value={mealSlot} onValueChange={(v) => setMealSlot(v as MealSlot)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MEAL_SLOT_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Protein Source</Label>
            {proteinSources.length > 0 && (
              <Select onValueChange={handleProteinSourceSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Quick pick from your foods..." />
                </SelectTrigger>
                <SelectContent>
                  {proteinSources.map(source => (
                    <SelectItem key={source.id} value={source.id}>
                      {source.name}
                      {source.typicalProteinGrams && ` (${source.typicalProteinGrams}g)`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Input
              value={proteinSource}
              onChange={(e) => setProteinSource(e.target.value)}
              placeholder="Or type a protein source..."
            />
          </div>

          <div className="space-y-2">
            <Label>Protein (grams)</Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              value={proteinGrams}
              onChange={(e) => setProteinGrams(e.target.value)}
              placeholder="e.g. 30"
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
                id="anti-inflammatory"
                checked={antiInflammatory}
                onCheckedChange={(checked) => setAntiInflammatory(checked === true)}
              />
              <Label htmlFor="anti-inflammatory" className="text-sm cursor-pointer">
                Anti-inflammatory foods
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="irritant"
                checked={irritantViolation}
                onCheckedChange={(checked) => setIrritantViolation(checked === true)}
              />
              <Label htmlFor="irritant" className="text-sm cursor-pointer text-red-600">
                Irritant violation
              </Label>
            </div>
          </div>

          {irritantViolation && (
            <div className="space-y-2">
              <Label>What was the irritant?</Label>
              <Input
                value={irritantNotes}
                onChange={(e) => setIrritantNotes(e.target.value)}
                placeholder="e.g. tomato sauce, coffee"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">{initialData ? 'Update' : 'Log Meal'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MealLogForm;
