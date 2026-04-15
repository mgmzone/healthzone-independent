import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportAsCsv } from '@/lib/utils/csv';
import { useWeightData } from '@/hooks/useWeightData';
import { useExerciseData } from '@/hooks/useExerciseData';
import { useFastingData } from '@/hooks/useFastingData';
import { useMealData } from '@/hooks/useMealData';
import { useDailyGoalsData } from '@/hooks/useDailyGoalsData';

function stamp() {
  return new Date().toISOString().split('T')[0];
}

const DataTab: React.FC = () => {
  const { weighIns } = useWeightData();
  const { exerciseLogs } = useExerciseData();
  const { fastingLogs } = useFastingData();
  const { mealLogs } = useMealData();
  const { goals, entries } = useDailyGoalsData();

  const exports: Array<{ label: string; count: number; onClick: () => void }> = [
    {
      label: 'Weigh-ins',
      count: weighIns.length,
      onClick: () => exportAsCsv(`healthzone_weighins_${stamp()}.csv`, weighIns as any),
    },
    {
      label: 'Exercise logs',
      count: exerciseLogs.length,
      onClick: () => exportAsCsv(`healthzone_exercise_${stamp()}.csv`, exerciseLogs as any),
    },
    {
      label: 'Fasting logs',
      count: fastingLogs.length,
      onClick: () => exportAsCsv(`healthzone_fasting_${stamp()}.csv`, fastingLogs as any),
    },
    {
      label: 'Meal logs',
      count: mealLogs.length,
      onClick: () => exportAsCsv(`healthzone_meals_${stamp()}.csv`, mealLogs as any),
    },
    {
      label: 'Daily goals',
      count: goals.length,
      onClick: () => exportAsCsv(`healthzone_goals_${stamp()}.csv`, goals as any),
    },
    {
      label: 'Daily goal entries',
      count: entries.length,
      onClick: () => exportAsCsv(`healthzone_goal_entries_${stamp()}.csv`, entries as any),
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Export your data</h3>
        <p className="text-sm text-muted-foreground">
          Download CSV files of your tracked data. Exports include the records loaded for the active period.
        </p>
      </div>
      <div className="space-y-2">
        {exports.map(e => (
          <div
            key={e.label}
            className="flex items-center justify-between rounded-md border px-4 py-3"
          >
            <div>
              <div className="font-medium text-sm">{e.label}</div>
              <div className="text-xs text-muted-foreground">{e.count} record{e.count === 1 ? '' : 's'}</div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={e.onClick}
              disabled={e.count === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataTab;
