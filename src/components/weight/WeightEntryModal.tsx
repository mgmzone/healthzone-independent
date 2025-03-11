
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import BaseWeightForm from './BaseWeightForm';

interface WeightEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (weight: number, date: Date, additionalMetrics?: {
    bmi?: number;
    bodyFatPercentage?: number;
    skeletalMuscleMass?: number;
    boneMass?: number;
    bodyWaterPercentage?: number;
  }) => void;
  unit: string;
}

const WeightEntryModal: React.FC<WeightEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  unit
}) => {
  const handleClose = () => {
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleClose();
      }
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Weight</DialogTitle>
        </DialogHeader>
        <BaseWeightForm 
          onClose={handleClose}
          onSave={onSave}
          unit={unit}
        />
      </DialogContent>
    </Dialog>
  );
};

export default WeightEntryModal;
