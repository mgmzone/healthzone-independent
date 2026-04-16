import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DatePickerField from '@/components/weight/DatePickerField';
import { ExerciseLog, EXERCISE_CATEGORIES, EXERCISE_CATEGORY_LABELS } from '@/lib/types';

interface ExerciseFormFieldsProps {
  formData: Partial<ExerciseLog>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<ExerciseLog>>>;
  isImperial: boolean;
  displayDistance: string;
  handleDistanceChange: (value: string) => void;
}

const ExerciseFormFields: React.FC<ExerciseFormFieldsProps> = ({
  formData,
  setFormData,
  isImperial,
  displayDistance,
  handleDistanceChange,
}) => {
  const distanceUnit = isImperial ? 'mi' : 'km';

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <DatePickerField
          date={formData.date || new Date()}
          onChange={(date) => setFormData({ ...formData, date })}
        />

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value as any })}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {EXERCISE_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {EXERCISE_CATEGORY_LABELS[cat]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="activityName">Activity Name</Label>
        <Input
          id="activityName"
          value={formData.activityName || ''}
          onChange={(e) => setFormData({ ...formData, activityName: e.target.value })}
          placeholder="e.g. Jiu Jitsu, Deadlift session, Trail run"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minutes">Duration (minutes)</Label>
          <Input
            id="minutes"
            type="number"
            value={formData.minutes || ''}
            onChange={(e) => setFormData({ ...formData, minutes: parseInt(e.target.value) || 0 })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="intensity">Intensity</Label>
          <Select
            value={formData.intensity}
            onValueChange={(value) => setFormData({ ...formData, intensity: value as any })}
          >
            <SelectTrigger id="intensity">
              <SelectValue placeholder="Select intensity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Easy</SelectItem>
              <SelectItem value="medium">Moderate</SelectItem>
              <SelectItem value="high">Intense</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="distance">Distance ({distanceUnit})</Label>
          <Input
            id="distance"
            type="text"
            inputMode="decimal"
            value={displayDistance}
            onChange={(e) => handleDistanceChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="calories">Calories burned</Label>
          <Input
            id="calories"
            type="number"
            value={formData.caloriesBurned ?? ''}
            onChange={(e) =>
              setFormData({ ...formData, caloriesBurned: parseInt(e.target.value) || undefined })
            }
            placeholder="Optional"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="steps">Steps</Label>
        <Input
          id="steps"
          type="number"
          value={formData.steps || ''}
          onChange={(e) => setFormData({ ...formData, steps: parseInt(e.target.value) || undefined })}
          placeholder="Optional"
        />
      </div>

      <HeartRateFields formData={formData} setFormData={setFormData} />
    </>
  );
};

export default ExerciseFormFields;

interface HeartRateFieldsProps {
  formData: Partial<ExerciseLog>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<ExerciseLog>>>;
}

const HeartRateFields: React.FC<HeartRateFieldsProps> = ({ formData, setFormData }) => (
  <div className="space-y-2">
    <Label>Heart Rate (optional)</Label>
    <div className="grid grid-cols-3 gap-2">
      <Input
        placeholder="Lowest"
        type="number"
        value={formData.lowestHeartRate || ''}
        onChange={(e) => setFormData({ ...formData, lowestHeartRate: parseInt(e.target.value) || undefined })}
      />
      <Input
        placeholder="Average"
        type="number"
        value={formData.averageHeartRate || ''}
        onChange={(e) => setFormData({ ...formData, averageHeartRate: parseInt(e.target.value) || undefined })}
      />
      <Input
        placeholder="Highest"
        type="number"
        value={formData.highestHeartRate || ''}
        onChange={(e) => setFormData({ ...formData, highestHeartRate: parseInt(e.target.value) || undefined })}
      />
    </div>
  </div>
);
