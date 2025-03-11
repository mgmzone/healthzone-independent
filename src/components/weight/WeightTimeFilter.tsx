
import React from 'react';
import { Button } from "@/components/ui/button";
import { CalendarDays, Calendar, CalendarRange } from "lucide-react";
import { TimeFilter } from '@/lib/types';

interface WeightTimeFilterProps {
  selectedFilter: TimeFilter;
  onFilterChange: (filter: TimeFilter) => void;
}

const WeightTimeFilter: React.FC<WeightTimeFilterProps> = ({
  selectedFilter,
  onFilterChange
}) => {
  return (
    <div className="flex space-x-2 mb-6">
      <Button
        variant={selectedFilter === 'week' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange('week')}
        className="flex items-center gap-2"
      >
        <CalendarDays className="h-4 w-4" />
        <span>Week</span>
      </Button>
      <Button
        variant={selectedFilter === 'month' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange('month')}
        className="flex items-center gap-2"
      >
        <Calendar className="h-4 w-4" />
        <span>Month</span>
      </Button>
      <Button
        variant={selectedFilter === 'period' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange('period')}
        className="flex items-center gap-2"
      >
        <CalendarRange className="h-4 w-4" />
        <span>Period</span>
      </Button>
    </div>
  );
};

export default WeightTimeFilter;
