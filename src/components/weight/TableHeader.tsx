
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TableHeaderProps {
  onAddWeight: () => void;
  isPeriodActive: boolean;
}

const TableHeader: React.FC<TableHeaderProps> = ({
  onAddWeight,
  isPeriodActive
}) => {
  return (
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
  );
};

export default TableHeader;
