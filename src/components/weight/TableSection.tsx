
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import WeightTable from '@/components/weight/WeightTable';
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
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Weight History</h2>
        <Button 
          variant="default" 
          onClick={onAddWeight}
          disabled={!isPeriodActive}
          size="sm"
        >
          <Plus className="mr-2" /> Add Weight
        </Button>
      </div>

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
