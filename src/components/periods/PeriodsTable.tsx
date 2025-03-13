
import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Period } from '@/lib/types';
import { getWeeksInPeriod, getMonthsInPeriod } from '@/lib/utils/dateUtils';
import { Pencil, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import PeriodEntryModal from './PeriodEntryModal';

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

  const formatWeight = (weight: number): string => {
    return weight.toFixed(1);
  };

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
          <thead>
            <tr className="bg-muted/50">
              <th className="px-4 py-3 text-left">Period</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-center">Start Weight</th>
              <th className="px-4 py-3 text-center">Target Weight</th>
              <th className="px-4 py-3 text-center">Current Weight</th>
              <th className="px-4 py-3 text-center">Fasting</th>
              <th className="px-4 py-3 text-center">Duration</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {periods.map(period => {
              const formattedStartDate = format(new Date(period.startDate), "MMM d, yyyy");
              const formattedEndDate = period.endDate 
                ? format(new Date(period.endDate), "MMM d, yyyy")
                : "Present";
              
              const weeks = getWeeksInPeriod(period.startDate, period.endDate);
              const months = getMonthsInPeriod(period.startDate, period.endDate);
              
              // Direct use of converted weights from the period object
              const isImperial = weightUnit === 'lbs';
              const displayStartWeight = isImperial ? period.startWeight * 2.20462 : period.startWeight;
              const displayTargetWeight = isImperial ? period.targetWeight * 2.20462 : period.targetWeight;
              
              const weightChange = latestWeight 
                ? Math.abs(displayStartWeight - latestWeight)
                : 0;
              const weightDirection = latestWeight && latestWeight < displayStartWeight 
                ? 'lost' 
                : 'gained';
                
              return (
                <tr 
                  key={period.id} 
                  className={`border-b ${currentPeriodId === period.id ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                >
                  <td className="px-4 py-4">
                    <div className="font-medium">{formattedStartDate} - {formattedEndDate}</div>
                    {currentPeriodId === period.id && (
                      <span className="inline-block px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full mt-1">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={period.type === 'weightLoss' ? 'default' : 'secondary'}>
                      {period.type === 'weightLoss' ? 'Weight Loss' : 'Maintenance'}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-center">{formatWeight(displayStartWeight)} {weightUnit}</td>
                  <td className="px-4 py-4 text-center">{formatWeight(displayTargetWeight)} {weightUnit}</td>
                  <td className="px-4 py-4">
                    {latestWeight ? (
                      <div className="flex flex-col items-center">
                        <div className="font-medium">{formatWeight(latestWeight)} {weightUnit}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatWeight(weightChange)} {weightUnit} {weightDirection}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">-</div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">{period.fastingSchedule}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col items-center">
                      <div className="text-sm">{weeks} weeks</div>
                      <div className="text-xs text-muted-foreground">{months} months</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(period)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(period.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Period</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this period? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editingPeriod && (
        <PeriodEntryModal
          isOpen={true}
          onClose={() => setEditingPeriod(null)}
          onSave={(updatedPeriod) => {
            onUpdatePeriod({
              ...updatedPeriod,
              id: editingPeriod.id,
              userId: editingPeriod.userId
            });
            setEditingPeriod(null);
          }}
          defaultValues={{
            startWeight: weightUnit === 'lbs' ? editingPeriod.startWeight * 2.20462 : editingPeriod.startWeight,
            targetWeight: weightUnit === 'lbs' ? editingPeriod.targetWeight * 2.20462 : editingPeriod.targetWeight
          }}
          weightUnit={weightUnit}
          initialPeriod={editingPeriod}
        />
      )}
    </>
  );
};

export default PeriodsTable;
