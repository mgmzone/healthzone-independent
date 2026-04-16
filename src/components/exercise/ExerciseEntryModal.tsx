import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Brain, Loader2 } from 'lucide-react';
import { ExerciseLog } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
import { analyzeExercise } from '@/lib/services/aiService';
import ExerciseFormFields from './modal/ExerciseFormFields';

interface ExerciseEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<ExerciseLog>) => void;
  initialData?: Partial<ExerciseLog>;
}

const ExerciseEntryModal: React.FC<ExerciseEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const { profile } = useAuth();
  const isImperial = profile?.measurementUnit === 'imperial';

  const [distanceInputValue, setDistanceInputValue] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [aiAssessment, setAiAssessment] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string>('');

  const [formData, setFormData] = useState<Partial<ExerciseLog>>(
    initialData || {
      date: new Date(),
      type: 'cardio',
      activityName: '',
      minutes: 30,
      intensity: 'medium',
      distance: undefined,
      steps: undefined,
      caloriesBurned: undefined,
      lowestHeartRate: undefined,
      highestHeartRate: undefined,
      averageHeartRate: undefined,
    }
  );

  useEffect(() => {
    if (isOpen) {
      setFormData(
        initialData || {
          date: new Date(),
          type: 'cardio',
          activityName: '',
          minutes: 30,
          intensity: 'medium',
          distance: undefined,
          steps: undefined,
          caloriesBurned: undefined,
          lowestHeartRate: undefined,
          highestHeartRate: undefined,
          averageHeartRate: undefined,
        }
      );
      setDescription('');
      setAiAssessment('');
      setAiError('');

      if (initialData?.distance !== undefined) {
        const displayValue = isImperial
          ? (initialData.distance * 0.621371).toFixed(2)
          : initialData.distance.toFixed(2);
        setDistanceInputValue(displayValue);
      } else {
        setDistanceInputValue('');
      }
    }
  }, [isOpen, initialData, isImperial]);

  const handleAnalyze = async () => {
    if (!description.trim()) {
      setAiError('Describe your workout first.');
      return;
    }
    setAiLoading(true);
    setAiError('');
    try {
      const res = await analyzeExercise({
        description,
        minutesHint: formData.minutes || undefined,
        avgHeartRate: formData.averageHeartRate || undefined,
      });
      setFormData((prev) => ({
        ...prev,
        type: res.category,
        activityName: res.activityName || prev.activityName,
        minutes: res.minutes > 0 ? res.minutes : prev.minutes,
        intensity: res.intensity,
        caloriesBurned: res.caloriesBurned > 0 ? res.caloriesBurned : prev.caloriesBurned,
      }));
      setAiAssessment(res.assessment);
    } catch (err: any) {
      setAiError(err.message || 'AI analysis failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let dataToSave = { ...formData };
    if (isImperial && dataToSave.distance) {
      const distanceInKm = dataToSave.distance / 0.621371;
      dataToSave = { ...dataToSave, distance: parseFloat(distanceInKm.toFixed(2)) };
    }
    onSave(dataToSave);
    onClose();
  };

  const handleDistanceChange = (value: string) => {
    setDistanceInputValue(value);
    if (value === '') {
      setFormData({ ...formData, distance: undefined });
      return;
    }
    if (/^(\d*\.?\d*|\.\d+)$/.test(value)) {
      if (value === '.') return;
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) setFormData({ ...formData, distance: parsed });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{initialData ? 'Edit Activity' : 'Log Exercise Activity'}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="workout-description">Describe your workout (optional)</Label>
              <Textarea
                id="workout-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Jiu Jitsu class 90 min, hard rolling, felt wrecked"
                rows={2}
              />
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAnalyze}
                  disabled={aiLoading || !description.trim()}
                >
                  {aiLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                  ) : (
                    <><Brain className="mr-2 h-4 w-4" /> Analyze with AI</>
                  )}
                </Button>
                {aiError && <p className="text-xs text-red-500">{aiError}</p>}
              </div>
              {aiAssessment && (
                <div className="rounded-md border bg-muted/50 p-2 text-xs">
                  <p className="font-medium mb-1 flex items-center gap-1">
                    <Brain className="h-3 w-3" /> AI Assessment
                  </p>
                  <p className="text-muted-foreground">{aiAssessment}</p>
                </div>
              )}
            </div>

            <ExerciseFormFields
              formData={formData}
              setFormData={setFormData}
              isImperial={isImperial}
              displayDistance={distanceInputValue}
              handleDistanceChange={handleDistanceChange}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Activity</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseEntryModal;
