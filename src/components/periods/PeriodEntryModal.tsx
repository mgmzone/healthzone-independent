
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Period } from '@/lib/types';
import PeriodForm from './PeriodForm';

interface PeriodEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (period: {
    startWeight: number,
    targetWeight: number,
    type: 'weightLoss' | 'maintenance',
    startDate: Date,
    endDate?: Date,
    fastingSchedule: string,
    weightLossPerWeek: number
  }) => void;
  defaultValues?: {
    startWeight?: number;
    targetWeight?: number;
    weightLossPerWeek?: number;
  };
  weightUnit: string;
  initialPeriod?: Period;
}

const PeriodEntryModal: React.FC<PeriodEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  defaultValues,
  weightUnit,
  initialPeriod
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{initialPeriod ? 'Edit Period' : 'Create New Period'}</DialogTitle>
        </DialogHeader>
        <PeriodForm
          onSave={onSave}
          onClose={onClose}
          defaultValues={defaultValues}
          weightUnit={weightUnit}
          initialPeriod={initialPeriod}
        />
      </DialogContent>
    </Dialog>
  );
};

export default PeriodEntryModal;
