
import React from 'react';
import { ExerciseLog, FastingLog } from '@/lib/types';
import FastingStats from '@/components/fasting/FastingStats';
import ActivitySummaryContainer from './activity/ActivitySummaryContainer';
import ExerciseMetrics from './activity/ExerciseMetrics';

interface ActivitySummarySectionProps {
  exerciseLogs: ExerciseLog[];
  fastingLogs: FastingLog[];
}

const ActivitySummarySection: React.FC<ActivitySummarySectionProps> = ({
  exerciseLogs,
  fastingLogs
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      <ActivitySummaryContainer title="Activity Minutes">
        <ExerciseMetrics exerciseLogs={exerciseLogs} />
      </ActivitySummaryContainer>
      
      <ActivitySummaryContainer title="Fasting Progress">
        <FastingStats 
          fastingLogs={fastingLogs}
          timeFilter="week"
        />
      </ActivitySummaryContainer>
    </div>
  );
};

export default ActivitySummarySection;
