
import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";

const ExerciseEmptyState: React.FC = () => {
  return (
    <TableRow>
      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
        No exercise activities recorded
      </TableCell>
    </TableRow>
  );
};

export default ExerciseEmptyState;
