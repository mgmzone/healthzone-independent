
import React from 'react';
import { ExerciseLog } from '@/lib/types';
import ExerciseWeekHeader from './ExerciseWeekHeader';
import ExerciseTableRow from './ExerciseTableRow';

interface ExerciseWeekGroupProps {
  weekKey: string;
  entries: ExerciseLog[];
  expandedWeeks: Record<string, boolean>;
  onToggleWeek: (weekKey: string) => void;
  onDelete: (id: string) => void;
}

const ExerciseWeekGroup: React.FC<ExerciseWeekGroupProps> = ({
  weekKey,
  entries,
  expandedWeeks,
  onToggleWeek,
  onDelete
}) => {
  const isExpanded = expandedWeeks[weekKey] !== false;
  
  return (
    <React.Fragment>
      <ExerciseWeekHeader 
        weekKey={weekKey} 
        entries={entries} 
        isExpanded={isExpanded}
        onToggle={() => onToggleWeek(weekKey)}
      />
      
      {isExpanded && entries.map((log) => (
        <ExerciseTableRow 
          key={log.id} 
          log={log} 
          onDelete={onDelete} 
        />
      ))}
    </React.Fragment>
  );
};

export default ExerciseWeekGroup;
