
import { format, subDays, subMonths, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isBefore, isAfter, parseISO } from 'date-fns';
import { SystemStats } from '@/lib/services/adminService';

export type TimeFilter = 'day' | 'week' | 'month' | 'year' | 'all';

export interface TimeFilteredData {
  name: string;
  weighIns?: number;
  fasts?: number;
  exercises?: number;
  count?: number;
}

export interface ActivityLogItem {
  date: Date | string;
  type: 'weighIn' | 'fast' | 'exercise';
}

// Generate summary data based on actual stats
export const generateSummaryData = (stats: SystemStats): TimeFilteredData[] => {
  return [
    { name: 'Weigh-ins', count: stats.totalWeighIns },
    { name: 'Fasting Logs', count: stats.totalFasts },
    { name: 'Exercise Logs', count: stats.totalExercises }
  ];
};

// Process activity logs into time-filtered data
export const processActivityLogs = (
  logs: ActivityLogItem[],
  filter: TimeFilter
): TimeFilteredData[] => {
  const today = new Date();
  const data: TimeFilteredData[] = [];
  
  if (logs.length === 0) {
    return getEmptyTimeFilterData(filter);
  }

  // Create date range based on filter
  let startDate: Date, endDate: Date;
  let dateFormat: string;
  let groupingFunction: (date: Date) => string;
  
  switch (filter) {
    case 'day':
      startDate = startOfDay(subDays(today, 1));
      endDate = endOfDay(today);
      dateFormat = 'ha';
      // Group by hour
      groupingFunction = (date) => format(date, 'H');
      // Initialize 24-hour data
      for (let i = 0; i < 24; i++) {
        const hour = new Date();
        hour.setHours(i, 0, 0, 0);
        data.push({
          name: format(hour, dateFormat),
          weighIns: 0,
          fasts: 0,
          exercises: 0
        });
      }
      break;
      
    case 'week':
      startDate = startOfWeek(today);
      endDate = endOfWeek(today);
      dateFormat = 'EEE';
      // Group by day of week
      groupingFunction = (date) => format(date, 'E');
      // Initialize week data
      for (let i = 0; i < 7; i++) {
        const day = subDays(endOfWeek(today), 6 - i);
        data.push({
          name: format(day, dateFormat),
          weighIns: 0,
          fasts: 0,
          exercises: 0
        });
      }
      break;
      
    case 'month':
      startDate = startOfMonth(today);
      endDate = endOfMonth(today);
      dateFormat = 'd';
      // Group by day of month
      groupingFunction = (date) => format(date, 'd');
      // Initialize month data
      const daysInMonth = endOfMonth(today).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        const day = new Date(today.getFullYear(), today.getMonth(), i);
        data.push({
          name: format(day, dateFormat),
          weighIns: 0,
          fasts: 0,
          exercises: 0
        });
      }
      break;
      
    case 'year':
      startDate = startOfYear(today);
      endDate = endOfYear(today);
      dateFormat = 'MMM';
      // Group by month
      groupingFunction = (date) => format(date, 'M');
      // Initialize year data
      for (let i = 0; i < 12; i++) {
        const month = new Date(today.getFullYear(), i, 1);
        data.push({
          name: format(month, dateFormat),
          weighIns: 0,
          fasts: 0,
          exercises: 0
        });
      }
      break;
      
    case 'all':
    default:
      // Return summary data for 'all' filter
      return [
        { name: 'Weigh-ins', count: 0 },
        { name: 'Fasting Logs', count: 0 },
        { name: 'Exercise Logs', count: 0 }
      ];
  }

  // Count activities by time period
  logs.forEach(log => {
    const logDate = typeof log.date === 'string' ? parseISO(log.date) : log.date;
    
    // Skip if outside the date range
    if (isBefore(logDate, startDate) || isAfter(logDate, endDate)) {
      return;
    }
    
    const key = groupingFunction(logDate);
    
    // Find the corresponding data entry
    const entry = data.find(d => {
      switch (filter) {
        case 'day':
          return format(new Date().setHours(parseInt(key), 0, 0, 0), dateFormat) === d.name;
        case 'week':
          return format(parseWeekday(key), dateFormat) === d.name;
        case 'month':
          return parseInt(key).toString() === d.name;
        case 'year':
          return format(new Date(today.getFullYear(), parseInt(key) - 1, 1), dateFormat) === d.name;
        default:
          return false;
      }
    });
    
    if (entry) {
      if (log.type === 'weighIn') {
        entry.weighIns = (entry.weighIns || 0) + 1;
      } else if (log.type === 'fast') {
        entry.fasts = (entry.fasts || 0) + 1;
      } else if (log.type === 'exercise') {
        entry.exercises = (entry.exercises || 0) + 1;
      }
    }
  });
  
  return data;
};

// Helper function to convert weekday number to date
function parseWeekday(weekday: string): Date {
  const today = new Date();
  const startOfWeekDate = startOfWeek(today);
  const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(weekday);
  return dayOfWeek >= 0 
    ? new Date(startOfWeekDate.setDate(startOfWeekDate.getDate() + dayOfWeek))
    : startOfWeekDate;
}

// Get empty data structure based on time filter
function getEmptyTimeFilterData(filter: TimeFilter): TimeFilteredData[] {
  const today = new Date();
  
  switch (filter) {
    case 'day':
      return Array.from({ length: 24 }, (_, i) => {
        const hour = new Date();
        hour.setHours(i, 0, 0, 0);
        return {
          name: format(hour, 'ha'),
          weighIns: 0,
          fasts: 0,
          exercises: 0
        };
      });
      
    case 'week':
      return Array.from({ length: 7 }, (_, i) => {
        const day = subDays(endOfWeek(today), 6 - i);
        return {
          name: format(day, 'EEE'),
          weighIns: 0,
          fasts: 0,
          exercises: 0
        };
      });
      
    case 'month':
      const daysInMonth = endOfMonth(today).getDate();
      return Array.from({ length: daysInMonth }, (_, i) => ({
        name: (i + 1).toString(),
        weighIns: 0,
        fasts: 0,
        exercises: 0
      }));
      
    case 'year':
      return Array.from({ length: 12 }, (_, i) => {
        const month = new Date(today.getFullYear(), i, 1);
        return {
          name: format(month, 'MMM'),
          weighIns: 0,
          fasts: 0,
          exercises: 0
        };
      });
      
    case 'all':
    default:
      return [
        { name: 'Weigh-ins', count: 0 },
        { name: 'Fasting Logs', count: 0 },
        { name: 'Exercise Logs', count: 0 }
      ];
  }
}

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
