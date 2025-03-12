
import React, { useState, useEffect } from 'react';
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
  useEffect(() => {
    if (initialData?.distance !== undefined) {
      // If imperial, convert kilometers to miles for display
      const displayValue = isImperial 
        ? (initialData.distance * 0.621371).toFixed(2)
        : initialData.distance.toFixed(2);
      setDistanceInputValue(displayValue);
    } else {
      setDistanceInputValue('');
    }
  }, [initialData, isImperial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If using imperial, convert miles to km for storage
    let dataToSave = {...formData};
    
    if (isImperial && dataToSave.distance) {
      // Convert miles to kilometers for storage
      const distanceInKm = dataToSave.distance / 0.621371;
      dataToSave = {
        ...dataToSave, 
        distance: parseFloat(distanceInKm.toFixed(2))
      };
    }
    
    onSave(dataToSave);
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
        // Store the value as entered by the user (in miles or km depending on preference)
        // We'll convert it when submitting the form
        setFormData({
          ...formData,
          distance: parsedValue
        });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[85vh] overflow-y-auto">
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
