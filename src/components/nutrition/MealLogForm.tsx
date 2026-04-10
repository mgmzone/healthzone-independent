import React, { useState, useEffect, FormEvent } from 'react';
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
import { Brain, Loader2 } from 'lucide-react';
import { MealLog, ProteinSource, DEFAULT_MEAL_NAMES } from '@/lib/types';
import { evaluateMeal } from '@/lib/services/aiService';
import { useAuth } from '@/lib/AuthContext';
import DatePickerField from '@/components/weight/DatePickerField';

interface MealLogFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<MealLog>) => Promise<any>;
  proteinSources: ProteinSource[];
  recentMealNames: string[];
  initialData?: MealLog;
}

const MealLogForm: React.FC<MealLogFormProps> = ({
  isOpen,
  onClose,
  onSave,
  proteinSources,
  recentMealNames,
  initialData,
}) => {
  const { profile } = useAuth();
  const hasApiKey = Boolean(profile?.claudeApiKey);

  const [date, setDate] = useState<Date>(new Date());
  const [mealSlot, setMealSlot] = useState('');
  const [proteinGrams, setProteinGrams] = useState<string>('');
  const [proteinSource, setProteinSource] = useState('');
  const [irritantViolation, setIrritantViolation] = useState(false);
  const [irritantNotes, setIrritantNotes] = useState('');
  const [antiInflammatory, setAntiInflammatory] = useState(false);
  const [notes, setNotes] = useState('');
  const [aiAssessment, setAiAssessment] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  // Build meal name suggestions from recent usage + defaults
  const mealNameSuggestions = [...new Set([...recentMealNames, ...DEFAULT_MEAL_NAMES])];

  // Sync form state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setDate(initialData?.date ? new Date(initialData.date) : new Date());
      setMealSlot(initialData?.mealSlot || '');
      setProteinGrams(initialData?.proteinGrams?.toString() || '');
      setProteinSource(initialData?.proteinSource || '');
      setIrritantViolation(initialData?.irritantViolation || false);
      setIrritantNotes(initialData?.irritantNotes || '');
      setAntiInflammatory(initialData?.antiInflammatory || false);
      setNotes(initialData?.notes || '');
      setAiAssessment(initialData?.aiAssessment || '');
      setAiError('');
    }
  }, [isOpen, initialData]);

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

  const handleAskAI = async () => {
    if (!proteinSource && !notes) return;
    setAiLoading(true);
    setAiError('');
    setAiAssessment('');
    try {
      const result = await evaluateMeal({
        proteinSource,
        notes,
        mealSlot: mealSlot || undefined,
      });
      if (result.proteinEstimate > 0) {
        setProteinGrams(result.proteinEstimate.toString());
      }
      setAiAssessment(result.assessment);
    } catch (err: any) {
      setAiError(err.message || 'AI evaluation failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsedGrams = proteinGrams ? parseFloat(proteinGrams) : undefined;
    await onSave({
      date,
      mealSlot: mealSlot || 'Meal',
      proteinGrams: parsedGrams,
      proteinSource: proteinSource || undefined,
      irritantViolation,
      irritantNotes: irritantViolation ? irritantNotes : undefined,
      antiInflammatory,
      notes: notes || undefined,
      aiAssessment: aiAssessment || undefined,
      aiProteinEstimate: aiAssessment ? parsedGrams : undefined,
    });
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
            <DatePickerField date={date} onChange={setDate} />
            <div className="space-y-2">
              <Label>Meal Name</Label>
              <Input
                value={mealSlot}
                onChange={(e) => setMealSlot(e.target.value)}
                placeholder="e.g. Lunch, OMAD, Snack..."
                list="meal-name-suggestions"
              />
              <datalist id="meal-name-suggestions">
                {mealNameSuggestions.map(name => (
                  <option key={name} value={name} />
                ))}
              </datalist>
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

          {hasApiKey && (
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAskAI}
                disabled={aiLoading || (!proteinSource && !notes)}
                className="w-full"
              >
                {aiLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Evaluating...</>
                ) : (
                  <><Brain className="mr-2 h-4 w-4" /> Ask AI to Evaluate</>
                )}
              </Button>
              {aiError && (
                <p className="text-sm text-red-500">{aiError}</p>
              )}
              {aiAssessment && (
                <div className="rounded-md border bg-muted/50 p-3 text-sm">
                  <p className="font-medium mb-1 flex items-center gap-1">
                    <Brain className="h-3 w-3" /> AI Assessment
                  </p>
                  <p className="text-muted-foreground">{aiAssessment}</p>
                </div>
              )}
            </div>
          )}

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
