
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExerciseLog } from '@/lib/types';
import DatePickerField from '@/components/weight/DatePickerField';
import { useAuth } from '@/lib/AuthContext';

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
  initialData
}) => {
  const { profile } = useAuth();
  const isImperial = profile?.measurementUnit === 'imperial';
  const distanceUnit = isImperial ? 'mi' : 'km';

  const [formData, setFormData] = useState<Partial<ExerciseLog>>(
    initialData || {
      date: new Date(),
      type: 'walk',
      minutes: 30,
      intensity: 'medium',
      distance: undefined,
      steps: undefined,
      lowestHeartRate: undefined,
      highestHeartRate: undefined,
      averageHeartRate: undefined
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If using imperial, convert miles to km for storage
    if (isImperial && formData.distance) {
      const distanceInKm = formData.distance / 0.621371;
      onSave({...formData, distance: distanceInKm});
    } else {
      onSave(formData);
    }
    
    onClose();
  };

  // If using imperial, convert km to miles for display
  const displayDistance = () => {
    if (formData.distance === undefined) return '';
    if (isImperial && formData.distance) {
      return (formData.distance * 0.621371).toFixed(2);
    }
    return formData.distance.toFixed(2);
  };

  const handleDistanceChange = (value: string) => {
    // Parse the input value, limiting to 2 decimal places
    const parsedValue = parseFloat(parseFloat(value).toFixed(2));
    setFormData({ 
      ...formData, 
      distance: isNaN(parsedValue) ? undefined : parsedValue
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Log Exercise Activity</DialogTitle>
          </DialogHeader>
          
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
                  type="number"
                  step="0.01"
                  value={displayDistance()}
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
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Activity</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseEntryModal;
