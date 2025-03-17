
import React from 'react';
import { Badge } from '@/components/ui/badge';

export type TimeFilter = 'day' | 'week' | 'month' | 'year' | 'all';

interface TimeFilterSelectorProps {
  timeFilter: TimeFilter;
  onFilterChange: (filter: TimeFilter) => void;
}

const TimeFilterSelector: React.FC<TimeFilterSelectorProps> = ({ 
  timeFilter, 
  onFilterChange 
}) => {
  return (
    <div className="flex space-x-2">
      <Badge 
        onClick={() => onFilterChange('day')} 
        className={`cursor-pointer ${timeFilter === 'day' ? 'bg-primary' : 'bg-secondary'}`}
      >
        Day
      </Badge>
      <Badge 
        onClick={() => onFilterChange('week')} 
        className={`cursor-pointer ${timeFilter === 'week' ? 'bg-primary' : 'bg-secondary'}`}
      >
        Week
      </Badge>
      <Badge 
        onClick={() => onFilterChange('month')} 
        className={`cursor-pointer ${timeFilter === 'month' ? 'bg-primary' : 'bg-secondary'}`}
      >
        Month
      </Badge>
      <Badge 
        onClick={() => onFilterChange('year')} 
        className={`cursor-pointer ${timeFilter === 'year' ? 'bg-primary' : 'bg-secondary'}`}
      >
        Year
      </Badge>
      <Badge 
        onClick={() => onFilterChange('all')} 
        className={`cursor-pointer ${timeFilter === 'all' ? 'bg-primary' : 'bg-secondary'}`}
      >
        All
      </Badge>
    </div>
  );
};

export default TimeFilterSelector;
