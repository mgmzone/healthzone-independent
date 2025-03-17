
import { TimeFilteredData } from './types';
import { SystemStats } from '@/lib/services/adminService';

// Generate summary data based on actual stats
export const generateSummaryData = (stats: SystemStats): TimeFilteredData[] => {
  return [
    { name: 'Weigh-ins', count: stats.totalWeighIns },
    { name: 'Fasting Logs', count: stats.totalFasts },
    { name: 'Exercise Logs', count: stats.totalExercises }
  ];
};
