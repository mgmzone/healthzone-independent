
import React from 'react';
import { Button } from '@/components/ui/button';
import { TimeFilter } from '@/lib/types';

interface ExerciseTimeFilterProps {
  value: TimeFilter;
  onChange: (filter: TimeFilter) => void;
}

const ExerciseTimeFilter: React.FC<ExerciseTimeFilterProps> = ({
  value,
  onChange
}) => {
  return (
    <div className="flex bg-muted rounded-md p-1">
      <Button
        variant={value === 'week' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('week')}
        className="text-xs px-3"
      >
        Week
      </Button>
      <Button
        variant={value === 'month' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('month')}
        className="text-xs px-3"
      >
        Month
      </Button>
      <Button
        variant={value === 'period' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('period')}
        className="text-xs px-3"
      >
        Period
      </Button>
    </div>
  );
};

export default ExerciseTimeFilter;
