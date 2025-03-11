
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
      onSave({...formData, distance: parseFloat(distanceInKm.toFixed(2))});
    } else {
      onSave(formData);
    }
    
    onClose();
  };

  const getDisplayDistance = () => {
    if (formData.distance === undefined) return '';
    if (isImperial) {
      return (formData.distance * 0.621371).toFixed(2);
    }
    return formData.distance.toFixed(2);
  };

  const handleDistanceChange = (value: string) => {
    // Simply pass the raw input string to the form data
    // This allows entering values like "3.10"
    if (value === '') {
      setFormData({
        ...formData,
        distance: undefined
      });
      return;
    }
    
    // Validate that the input is a valid decimal number
    if (/^\d*\.?\d*$/.test(value)) {
      const parsedValue = parseFloat(value);
      
      if (!isNaN(parsedValue)) {
        setFormData({
          ...formData,
          distance: isImperial 
            ? parsedValue / 0.621371 // Store as km internally
            : parsedValue
        });
      }
    }
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
            displayDistance={getDisplayDistance()}
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
