
import { format, endOfMonth, endOfWeek, subDays } from 'date-fns';
import { TimeFilter, TimeFilteredData } from './types';

// Get empty data structure based on time filter
export function getEmptyTimeFilterData(filter: TimeFilter): TimeFilteredData[] {
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
