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
import { Brain, Loader2 } from 'lucide-react';
import { MealLog, ProteinSource, DEFAULT_MEAL_NAMES } from '@/lib/types';
import { evaluateMeal } from '@/lib/services/aiService';
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
  recentMealNames,
  initialData,
}) => {
  const [date, setDate] = useState<Date>(new Date());
  const [mealSlot, setMealSlot] = useState('');
  const [description, setDescription] = useState('');
  const [proteinGrams, setProteinGrams] = useState<string>('');
  const [proteinEdited, setProteinEdited] = useState(false);
  const [irritantViolation, setIrritantViolation] = useState(false);
  const [irritantNotes, setIrritantNotes] = useState('');
  const [antiInflammatory, setAntiInflammatory] = useState(false);
  const [aiAssessment, setAiAssessment] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiProteinFromAi, setAiProteinFromAi] = useState<number | null>(null);

  const mealNameSuggestions = [...new Set([...recentMealNames, ...DEFAULT_MEAL_NAMES])];

  useEffect(() => {
    if (isOpen) {
      setDate(initialData?.date ? new Date(initialData.date) : new Date());
      setMealSlot(initialData?.mealSlot || '');
      setDescription(initialData?.notes || initialData?.proteinSource || '');
      setProteinGrams(initialData?.proteinGrams?.toString() || '');
      setProteinEdited(false);
      setIrritantViolation(initialData?.irritantViolation || false);
      setIrritantNotes(initialData?.irritantNotes || '');
      setAntiInflammatory(initialData?.antiInflammatory || false);
      setAiAssessment(initialData?.aiAssessment || '');
      setAiProteinFromAi(initialData?.aiProteinEstimate ?? null);
      setAiError('');
    }
  }, [isOpen, initialData]);

  const handleAskAI = async () => {
    if (!description.trim()) {
      setAiError('Enter a meal description first.');
      return;
    }
    setAiLoading(true);
    setAiError('');
    setAiAssessment('');
    try {
      const result = await evaluateMeal({
        notes: description,
        mealSlot: mealSlot || undefined,
      });
      if (result.proteinEstimate > 0) {
        setProteinGrams(result.proteinEstimate.toString());
        setAiProteinFromAi(result.proteinEstimate);
        setProteinEdited(false);
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
      proteinSource: description || undefined,
      irritantViolation,
      irritantNotes: irritantViolation ? irritantNotes : undefined,
      antiInflammatory,
      notes: description || undefined,
      aiAssessment: aiAssessment || undefined,
      aiProteinEstimate: aiProteinFromAi ?? undefined,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>{initialData ? 'Edit Meal' : 'Log Meal'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
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
              <Label>What did you eat?</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. grilled chicken breast with broccoli and rice, ~6oz chicken"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Describe the meal in your own words — AI will estimate protein for you.
              </p>
            </div>

            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAskAI}
                disabled={aiLoading || !description.trim()}
                className="w-full"
              >
                {aiLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                ) : (
                  <><Brain className="mr-2 h-4 w-4" /> Analyze with AI</>
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

            <div className="space-y-2">
              <Label>Protein (grams)</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                value={proteinGrams}
                onChange={(e) => {
                  setProteinGrams(e.target.value);
                  setProteinEdited(true);
                }}
                placeholder="Run AI analyze, or enter manually"
              />
              {aiProteinFromAi !== null && proteinEdited && (
                <p className="text-xs text-muted-foreground">
                  AI estimated {aiProteinFromAi}g — you've overridden this.
                </p>
              )}
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
          </div>

          <DialogFooter className="border-t px-6 py-4 bg-background">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">{initialData ? 'Update' : 'Log Meal'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MealLogForm;
