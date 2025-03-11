
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface WeightEmptyStateProps {
  onAddWeight: () => void;
  isPeriodActive: boolean;
}

const WeightEmptyState: React.FC<WeightEmptyStateProps> = ({ 
  onAddWeight,
  isPeriodActive
}) => {
  return (
    <div className="text-center py-12">
      <p className="text-gray-500 mb-4">No weight data recorded yet</p>
      <Button onClick={onAddWeight} disabled={!isPeriodActive}>
        <Plus className="mr-2" /> Add Your First Weight
      </Button>
    </div>
  );
};

export default WeightEmptyState;
