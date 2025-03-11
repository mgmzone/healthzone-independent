
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DatePickerField from '@/components/weight/DatePickerField';
import { ExerciseLog } from '@/lib/types';

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
  handleDistanceChange
}) => {
  const distanceUnit = isImperial ? 'mi' : 'km';

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <DatePickerField
          date={formData.date || new Date()}
          onChange={(date) => setFormData({ ...formData, date })}
        />
        
        <div className="space-y-2">
          <Label htmlFor="type">Activity Type</Label>
          <Select 
            value={formData.type} 
            onValueChange={(value) => setFormData({ ...formData, type: value as any })}
          >
            <SelectTrigger id="type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="walk">Walking</SelectItem>
              <SelectItem value="run">Running</SelectItem>
              <SelectItem value="bike">Cycling</SelectItem>
              <SelectItem value="elliptical">Elliptical</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
          <Label htmlFor="steps">Steps</Label>
          <Input
            id="steps"
            type="number"
            value={formData.steps || ''}
            onChange={(e) => setFormData({ ...formData, steps: parseInt(e.target.value) || undefined })}
          />
        </div>
      </div>
      
      <HeartRateFields formData={formData} setFormData={setFormData} />
    </div>
  );
};

export default ExerciseFormFields;

// Extracting HeartRateFields to a separate component within the same file
interface HeartRateFieldsProps {
  formData: Partial<ExerciseLog>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<ExerciseLog>>>;
}

const HeartRateFields: React.FC<HeartRateFieldsProps> = ({ formData, setFormData }) => {
  return (
    <div className="space-y-2">
      <Label>Heart Rate (optional)</Label>
      <div className="grid grid-cols-3 gap-2">
        <Input
          placeholder="Lowest"
          type="number"
          value={formData.lowestHeartRate || ''}
          onChange={(e) => setFormData({ 
            ...formData, 
            lowestHeartRate: parseInt(e.target.value) || undefined 
          })}
        />
        <Input
          placeholder="Average"
          type="number"
          value={formData.averageHeartRate || ''}
          onChange={(e) => setFormData({ 
            ...formData, 
            averageHeartRate: parseInt(e.target.value) || undefined 
          })}
        />
        <Input
          placeholder="Highest"
          type="number"
          value={formData.highestHeartRate || ''}
          onChange={(e) => setFormData({ 
            ...formData, 
            highestHeartRate: parseInt(e.target.value) || undefined 
          })}
        />
      </div>
    </div>
  );
};
