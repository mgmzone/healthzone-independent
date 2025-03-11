
import React from 'react';
import { Card } from "@/components/ui/card";
import FastingStats from '@/components/fasting/FastingStats';
import ExerciseSummary from '@/components/exercise/ExerciseSummary';
import { ExerciseLog, FastingLog } from '@/lib/types';

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
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Activity Minutes</h2>
        <div className="h-64">
          <ExerciseSummary 
            exerciseLogs={exerciseLogs}
            isLoading={false}
            timeFilter="week"
            onTimeFilterChange={() => {}}
          />
        </div>
      </Card>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Fasting Progress</h2>
        <div className="h-64">
          <FastingStats 
            fastingLogs={fastingLogs}
            timeFilter="week"
          />
        </div>
      </Card>
    </div>
  );
};

export default ActivitySummarySection;
