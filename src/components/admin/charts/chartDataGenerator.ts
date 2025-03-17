
import { format, subDays, subMonths } from 'date-fns';
import { SystemStats } from '@/lib/services/adminService';

export type TimeFilter = 'day' | 'week' | 'month' | 'year' | 'all';

export interface TimeFilteredData {
  name: string;
  weighIns?: number;
  fasts?: number;
  exercises?: number;
  count?: number;
}

// Generate time-based chart data
export const generateTimeBasedData = (filter: TimeFilter): TimeFilteredData[] => {
  const today = new Date();
  const data: TimeFilteredData[] = [];
  
  switch (filter) {
    case 'day':
      // Last 24 hours in 6-hour intervals
      for (let i = 3; i >= 0; i--) {
        const time = subDays(today, i/4);
        data.push({
          name: format(time, 'ha'),
          weighIns: Math.floor(Math.random() * 5),
          fasts: Math.floor(Math.random() * 8),
          exercises: Math.floor(Math.random() * 6),
        });
      }
      break;
    case 'week':
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const day = subDays(today, i);
        data.push({
          name: format(day, 'EEE'),
          weighIns: Math.floor(Math.random() * 10),
          fasts: Math.floor(Math.random() * 15),
          exercises: Math.floor(Math.random() * 12),
        });
      }
      break;
    case 'month':
      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const week = subDays(today, i * 7);
        data.push({
          name: `Week ${4-i}`,
          weighIns: Math.floor(Math.random() * 30),
          fasts: Math.floor(Math.random() * 40),
          exercises: Math.floor(Math.random() * 35),
        });
      }
      break;
    case 'year':
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const month = subMonths(today, i);
        data.push({
          name: format(month, 'MMM'),
          weighIns: Math.floor(Math.random() * 80),
          fasts: Math.floor(Math.random() * 120),
          exercises: Math.floor(Math.random() * 100),
        });
      }
      break;
    case 'all':
    default:
      // Total summary - these will be replaced with actual data
      data.push({ name: 'Weigh-ins', count: 0 });
      data.push({ name: 'Fasting Logs', count: 0 });
      data.push({ name: 'Exercise Logs', count: 0 });
      break;
  }
  
  return data;
};

// Generate summary data based on actual stats
export const generateSummaryData = (stats: SystemStats): TimeFilteredData[] => {
  return [
    { name: 'Weigh-ins', count: stats.totalWeighIns },
    { name: 'Fasting Logs', count: stats.totalFasts },
    { name: 'Exercise Logs', count: stats.totalExercises }
  ];
};

// Chart configuration
export const chartConfig = {
  weighIns: {
    label: "Weigh-ins",
    color: "#38bdf8",
  },
  fasts: {
    label: "Fasting Logs",
    color: "#fb923c",
  },
  exercises: {
    label: "Exercise Logs",
    color: "#4ade80",
  },
};
