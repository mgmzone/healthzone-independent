
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

  // State for the raw input string of distance (before conversion)
  const [distanceInputValue, setDistanceInputValue] = useState<string>('');

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

  // Initialize the distance input value when the modal opens with initial data
  React.useEffect(() => {
    if (initialData?.distance !== undefined) {
      const displayValue = isImperial 
        ? (initialData.distance * 0.621371).toString() 
        : initialData.distance.toString();
      setDistanceInputValue(displayValue);
    } else {
      setDistanceInputValue('');
    }
  }, [initialData, isImperial]);

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

  const handleDistanceChange = (value: string) => {
    // Update the raw input value immediately for display
    setDistanceInputValue(value);
    
    // Handle empty input
    if (value === '') {
      setFormData({
        ...formData,
        distance: undefined
      });
      return;
    }
    
    // Accept any valid number format including decimals
    if (/^(\d*\.?\d*|\.\d+)$/.test(value)) {
      // Let users type a decimal point without immediately parsing it
      if (value === '.') {
        // Just update the display value, not the actual distance yet
        return;
      }
      
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
            displayDistance={distanceInputValue}
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
