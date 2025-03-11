
import React from 'react';
import ExerciseWeekHeader from './ExerciseWeekHeader';
import ExerciseTableRow from './ExerciseTableRow';
import { ExerciseLog } from '@/lib/types';

interface ExerciseWeekGroupProps {
  weekKey: string;
  entries: ExerciseLog[];
  expandedWeeks: Record<string, boolean>;
  onToggleWeek: (weekKey: string) => void;
  onDelete: (id: string) => void;
  onEdit: (log: ExerciseLog) => void;
}

const ExerciseWeekGroup: React.FC<ExerciseWeekGroupProps> = ({
  weekKey,
  entries,
  expandedWeeks,
  onToggleWeek,
  onDelete,
  onEdit
}) => {
  const isExpanded = expandedWeeks[weekKey] || false;
  
  return (
    <>
      <ExerciseWeekHeader
        weekKey={weekKey}
        entries={entries}
        isExpanded={isExpanded}
        onToggle={() => onToggleWeek(weekKey)}
      />
      
      {isExpanded && entries.map(log => (
        <ExerciseTableRow
          key={log.id}
          log={log}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </>
  );
};

export default ExerciseWeekGroup;
