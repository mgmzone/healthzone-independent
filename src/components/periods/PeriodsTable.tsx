
import React, { useState } from 'react';
import { Period } from '@/lib/types';
import PeriodEntryModal from './PeriodEntryModal';
import PeriodTableHeader from './PeriodTableHeader';
import PeriodTableRow from './PeriodTableRow';
import DeletePeriodDialog from './DeletePeriodDialog';
import { convertToMetric } from '@/lib/weight/convertWeight';

interface PeriodsTableProps {
  periods: Period[];
  currentPeriodId?: string;
  latestWeight: number | null;
  weightUnit: string;
  onUpdatePeriod: (period: Period) => void;
  onDeletePeriod: (id: string) => void;
}

const PeriodsTable: React.FC<PeriodsTableProps> = ({
  periods,
  currentPeriodId,
  latestWeight,
  weightUnit,
  onUpdatePeriod,
  onDeletePeriod
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [periodToDelete, setPeriodToDelete] = useState<string | null>(null);
  const [editingPeriod, setEditingPeriod] = useState<Period | null>(null);
  const isImperial = weightUnit === 'lbs';

  const handleEdit = (period: Period) => {
    setEditingPeriod(period);
  };

  const handleDelete = (id: string) => {
    setPeriodToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (periodToDelete) {
      onDeletePeriod(periodToDelete);
      setIsDeleteDialogOpen(false);
      setPeriodToDelete(null);
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <PeriodTableHeader />
          <tbody>
            {periods.map(period => (
              <PeriodTableRow
                key={period.id}
                period={period}
                isActive={currentPeriodId === period.id}
                latestWeight={latestWeight}
                weightUnit={weightUnit}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </tbody>
        </table>
      </div>

      <DeletePeriodDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirmDelete={confirmDelete}
      />

      {editingPeriod && (
        <PeriodEntryModal
          isOpen={true}
          onClose={() => setEditingPeriod(null)}
          onSave={(updatedPeriod) => {
            // Convert weights to metric (kg) for storage if imperial units are used
            const startWeight = isImperial ? convertToMetric(updatedPeriod.startWeight, true) : updatedPeriod.startWeight;
            const targetWeight = isImperial ? convertToMetric(updatedPeriod.targetWeight, true) : updatedPeriod.targetWeight;
            
            onUpdatePeriod({
              ...updatedPeriod,
              id: editingPeriod.id,
              userId: editingPeriod.userId,
              startWeight,
              targetWeight
            });
            setEditingPeriod(null);
          }}
          defaultValues={{
            // Display in the correct unit (lbs for imperial, kg for metric)
            startWeight: isImperial ? editingPeriod.startWeight * 2.20462 : editingPeriod.startWeight,
            targetWeight: isImperial ? editingPeriod.targetWeight * 2.20462 : editingPeriod.targetWeight
          }}
          weightUnit={weightUnit}
          initialPeriod={editingPeriod}
        />
      )}
    </>
  );
};

export default PeriodsTable;
