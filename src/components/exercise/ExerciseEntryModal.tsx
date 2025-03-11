
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExerciseLog } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
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
  initialData
}) => {
  const { profile } = useAuth();
  const isImperial = profile?.measurementUnit === 'imperial';

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
          
          <ExerciseFormFields 
            formData={formData}
            setFormData={setFormData}
            isImperial={isImperial}
            displayDistance={displayDistance}
            handleDistanceChange={handleDistanceChange}
          />
          
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
