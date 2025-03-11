
import React from 'react';
import WeightTable from '@/components/weight/WeightTable';
import TableHeader from '@/components/weight/TableHeader';
import { WeighIn } from '@/lib/types';

interface TableSectionProps {
  weighIns: WeighIn[];
  isImperial: boolean;
  onAddWeight: () => void;
  isPeriodActive: boolean;
  onUpdateWeighIn: (
    id: string,
    weight: number,
    date: Date,
    additionalMetrics: {
      bmi?: number;
      bodyFatPercentage?: number;
      skeletalMuscleMass?: number;
      boneMass?: number;
      bodyWaterPercentage?: number;
    }
  ) => void;
  onDeleteWeighIn: (id: string) => void;
}

const TableSection: React.FC<TableSectionProps> = ({
  weighIns,
  isImperial,
  onAddWeight,
  isPeriodActive,
  onUpdateWeighIn,
  onDeleteWeighIn
}) => {
  return (
    <>
      <TableHeader
        onAddWeight={onAddWeight}
        isPeriodActive={isPeriodActive}
      />

      <WeightTable 
        weighIns={weighIns} 
        isImperial={isImperial}
        onUpdateWeighIn={onUpdateWeighIn}
        onDeleteWeighIn={onDeleteWeighIn}
      />
    </>
  );
};

export default TableSection;
