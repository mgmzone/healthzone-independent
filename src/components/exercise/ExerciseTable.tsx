
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { ExerciseLog, TimeFilter } from '@/lib/types';
import ExerciseTimeFilter from './ExerciseTimeFilter';
import ExerciseEmptyState from './ExerciseEmptyState';
import ExerciseLoadingState from './ExerciseLoadingState';
import ExerciseWeekGroup from './ExerciseWeekGroup';
import { groupLogsByWeek } from './utils/exerciseUtils';

interface ExerciseTableProps {
  exerciseLogs: ExerciseLog[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  timeFilter: TimeFilter;
  onTimeFilterChange: (filter: TimeFilter) => void;
}

const ExerciseTable: React.FC<ExerciseTableProps> = ({ 
  exerciseLogs, 
  isLoading, 
  onDelete,
  timeFilter,
  onTimeFilterChange
}) => {
  const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>({});
  
  const groupedByWeek = groupLogsByWeek(exerciseLogs);
  
  const toggleWeekExpansion = (weekKey: string) => {
    setExpandedWeeks(prev => ({
      ...prev,
      [weekKey]: !prev[weekKey]
    }));
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Activity Log</h2>
        <ExerciseTimeFilter 
          value={timeFilter} 
          onChange={onTimeFilterChange}
        />
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead>Intensity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <ExerciseLoadingState />
              ) : exerciseLogs.length === 0 ? (
                <ExerciseEmptyState />
              ) : (
                Object.entries(groupedByWeek).map(([weekKey, entries]) => (
                  <ExerciseWeekGroup
                    key={weekKey}
                    weekKey={weekKey}
                    entries={entries}
                    expandedWeeks={expandedWeeks}
                    onToggleWeek={toggleWeekExpansion}
                    onDelete={onDelete}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExerciseTable;
