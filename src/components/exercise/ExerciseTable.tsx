
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
import ExerciseEntryModal from './ExerciseEntryModal';

interface ExerciseTableProps {
  exerciseLogs: ExerciseLog[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<ExerciseLog>) => void;
  timeFilter: TimeFilter;
  onTimeFilterChange: (filter: TimeFilter) => void;
  showTimeFilter?: boolean;
}

const ExerciseTable: React.FC<ExerciseTableProps> = ({ 
  exerciseLogs, 
  isLoading, 
  onDelete,
  onUpdate,
  timeFilter,
  onTimeFilterChange,
  showTimeFilter = true
}) => {
  const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>({});
  const [editingLog, setEditingLog] = useState<ExerciseLog | null>(null);
  
  const groupedByWeek = groupLogsByWeek(exerciseLogs);
  
  const toggleWeekExpansion = (weekKey: string) => {
    setExpandedWeeks(prev => ({
      ...prev,
      [weekKey]: !prev[weekKey]
    }));
  };

  const handleEdit = (log: ExerciseLog) => {
    setEditingLog(log);
  };

  const handleSave = (data: Partial<ExerciseLog>) => {
    if (editingLog) {
      onUpdate(editingLog.id, data);
      setEditingLog(null);
    }
  };
  
  return (
    <div className="space-y-6">
      {showTimeFilter && (
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Activity Log</h2>
          <ExerciseTimeFilter 
            value={timeFilter} 
            onChange={onTimeFilterChange}
          />
        </div>
      )}
      
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
                    onEdit={handleEdit}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editingLog && (
        <ExerciseEntryModal
          isOpen={!!editingLog}
          onClose={() => setEditingLog(null)}
          onSave={handleSave}
          initialData={editingLog}
        />
      )}
    </div>
  );
};

export default ExerciseTable;
