
import { format, subDays, startOfDay, endOfDay, startOfWeek, endOfWeek, 
  startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { TimeFilter } from './types';

// Gets date range and format based on time filter
export const getDateRangeAndFormat = (filter: TimeFilter): {
  startDate: Date;
  endDate: Date;
  dateFormat: string;
  groupingFunction: (date: Date) => string;
} => {
  const today = new Date();
  
  switch (filter) {
    case 'day':
      return {
        startDate: startOfDay(subDays(today, 1)),
        endDate: endOfDay(today),
        dateFormat: 'ha',
        // Group by hour
        groupingFunction: (date) => format(date, 'H')
      };
      
    case 'week':
      return {
        startDate: startOfWeek(today),
        endDate: endOfWeek(today),
        dateFormat: 'EEE',
        // Group by day of week
        groupingFunction: (date) => format(date, 'E')
      };
      
    case 'month':
      return {
        startDate: startOfMonth(today),
        endDate: endOfMonth(today),
        dateFormat: 'd',
        // Group by day of month
        groupingFunction: (date) => format(date, 'd')
      };
      
    case 'year':
      return {
        startDate: startOfYear(today),
        endDate: endOfYear(today),
        dateFormat: 'MMM',
        // Group by month
        groupingFunction: (date) => format(date, 'M')
      };
      
    default:
      // Default case should never be reached for this function
      return {
        startDate: startOfDay(today),
        endDate: endOfDay(today),
        dateFormat: 'd',
        groupingFunction: (date) => format(date, 'd')
      };
  }
};

// Helper function to convert weekday number to date
export const parseWeekday = (weekday: string): Date => {
  const today = new Date();
  const startOfWeekDate = startOfWeek(today);
  const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(weekday);
  return dayOfWeek >= 0 
    ? new Date(startOfWeekDate.setDate(startOfWeekDate.getDate() + dayOfWeek))
    : startOfWeekDate;
};
