
import React, { useState } from 'react';
import { WeighIn } from '@/lib/types';
import WeightTableHeader from './WeightTableHeader';
import WeightTableRow from './WeightTableRow';
import WeightTableEditRow from './WeightTableEditRow';
import DeleteWeightConfirmDialog from './DeleteWeightConfirmDialog';
import { 
  convertWeight, 
  convertMuscleOrBoneMass, 
  formatPercentage, 
  convertToMetric 
} from './WeightTableUtils';

interface WeightTableProps {
  weighIns: WeighIn[];
  isImperial: boolean;
  onUpdateWeighIn?: (id: string, weight: number, date: Date, additionalMetrics: {
    bmi?: number;
    bodyFatPercentage?: number;
    skeletalMuscleMass?: number;
    boneMass?: number;
    bodyWaterPercentage?: number;
  }) => void;
  onDeleteWeighIn?: (id: string) => void;
}

const WeightTable: React.FC<WeightTableProps> = ({ 
  weighIns, 
  isImperial, 
  onUpdateWeighIn,
  onDeleteWeighIn 
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    weight: string;
    date: Date;
    bmi: string;
    bodyFatPercentage: string;
    skeletalMuscleMass: string;
    boneMass: string;
    bodyWaterPercentage: string;
  }>({
    weight: '',
    date: new Date(),
    bmi: '',
    bodyFatPercentage: '',
    skeletalMuscleMass: '',
    boneMass: '',
    bodyWaterPercentage: ''
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleEdit = (entry: WeighIn) => {
    setEditingId(entry.id);
    setEditValues({
      weight: convertWeight(entry.weight, isImperial),
      date: new Date(entry.date),
      bmi: entry.bmi ? entry.bmi.toFixed(1) : '',
      bodyFatPercentage: entry.bodyFatPercentage ? entry.bodyFatPercentage.toFixed(1) : '',
      skeletalMuscleMass: entry.skeletalMuscleMass ? convertMuscleOrBoneMass(entry.skeletalMuscleMass, isImperial) : '',
      boneMass: entry.boneMass ? convertMuscleOrBoneMass(entry.boneMass, isImperial) : '',
      bodyWaterPercentage: entry.bodyWaterPercentage ? entry.bodyWaterPercentage.toFixed(1) : ''
    });
  };

  const handleSave = () => {
    if (!editingId || !onUpdateWeighIn) return;
    
    const weight = convertToMetric(editValues.weight, isImperial);
    if (!weight) return;

    const additionalMetrics = {
      bmi: editValues.bmi ? parseFloat(editValues.bmi) : undefined,
      bodyFatPercentage: editValues.bodyFatPercentage ? parseFloat(editValues.bodyFatPercentage) : undefined,
      skeletalMuscleMass: editValues.skeletalMuscleMass ? convertToMetric(editValues.skeletalMuscleMass, isImperial) : undefined,
      boneMass: editValues.boneMass ? convertToMetric(editValues.boneMass, isImperial) : undefined,
      bodyWaterPercentage: editValues.bodyWaterPercentage ? parseFloat(editValues.bodyWaterPercentage) : undefined
    };

    onUpdateWeighIn(editingId, weight, editValues.date, additionalMetrics);
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (onDeleteWeighIn) {
      onDeleteWeighIn(id);
    }
    setDeleteConfirmId(null);
  };

  // Progressive disclosure: only show a body-composition column if at least
  // one weigh-in has a value for it. Avoids a table of dashes when the user
  // only tracks weight.
  const hasBmi = weighIns.some((w) => w.bmi != null);
  const hasBodyFat = weighIns.some((w) => w.bodyFatPercentage != null);
  const hasMuscle = weighIns.some((w) => w.skeletalMuscleMass != null);
  const hasBone = weighIns.some((w) => w.boneMass != null);
  const hasWater = weighIns.some((w) => w.bodyWaterPercentage != null);
  const anyBodyComp = hasBmi || hasBodyFat || hasMuscle || hasBone || hasWater;

  // Entries arrive sorted newest-first; the "previous" entry for delta
  // purposes is the next index (i.e. older weigh-in).
  return (
    <>
      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-border">
          <WeightTableHeader
            isImperial={isImperial}
            showActions={!!(onUpdateWeighIn || onDeleteWeighIn)}
            hasBmi={hasBmi}
            hasBodyFat={hasBodyFat}
            hasMuscle={hasMuscle}
            hasBone={hasBone}
            hasWater={hasWater}
          />
          <tbody className="bg-card divide-y divide-border">
            {weighIns.map((entry, i) => (
              editingId === entry.id ? (
                <WeightTableEditRow
                  key={entry.id}
                  entry={entry}
                  editValues={editValues}
                  isImperial={isImperial}
                  onEditValueChange={setEditValues}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  hasBmi={hasBmi}
                  hasBodyFat={hasBodyFat}
                  hasMuscle={hasMuscle}
                  hasBone={hasBone}
                  hasWater={hasWater}
                />
              ) : (
                <WeightTableRow
                  key={entry.id}
                  entry={entry}
                  previousEntry={weighIns[i + 1]}
                  isImperial={isImperial}
                  onEdit={handleEdit}
                  onDelete={(id) => setDeleteConfirmId(id)}
                  convertWeight={(weight) => convertWeight(weight, isImperial)}
                  convertMuscleOrBoneMass={(mass) => convertMuscleOrBoneMass(mass, isImperial)}
                  formatPercentage={formatPercentage}
                  canEdit={!!onUpdateWeighIn}
                  canDelete={!!onDeleteWeighIn}
                  hasBmi={hasBmi}
                  hasBodyFat={hasBodyFat}
                  hasMuscle={hasMuscle}
                  hasBone={hasBone}
                  hasWater={hasWater}
                />
              )
            ))}
          </tbody>
        </table>
      </div>

      {!anyBodyComp && weighIns.length > 0 && (
        <p className="text-xs text-muted-foreground mt-2">
          Tip: tap the pencil on any row (or the Add Weight button) to also log BMI, body fat, muscle, bone mass, and body water.
        </p>
      )}

      <DeleteWeightConfirmDialog
        isOpen={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
        onConfirmDelete={() => deleteConfirmId && handleDelete(deleteConfirmId)}
      />
    </>
  );
};

export default WeightTable;
