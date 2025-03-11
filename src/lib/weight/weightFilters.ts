
import { WeighIn } from '@/lib/types';
import { isWithinInterval, startOfWeek, startOfMonth } from 'date-fns';

/**
 * Utility functions for filtering weight data by time periods
 */

/**
 * Filters weighIns by specified time period (week, month, or all)
 */
export const filterWeighInsByTimePeriod = (
  weighIns: WeighIn[], 
  timePeriod: 'week' | 'month' | 'period'
): WeighIn[] => {
  if (weighIns.length === 0) return [];
  
  const today = new Date();
  
  if (timePeriod === 'week') {
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Week starts on Monday
    return weighIns.filter(entry => 
      isWithinInterval(new Date(entry.date), { 
        start: weekStart, 
        end: today 
      })
    );
  } else if (timePeriod === 'month') {
    const monthStart = startOfMonth(today);
    return weighIns.filter(entry => 
      isWithinInterval(new Date(entry.date), { 
        start: monthStart, 
        end: today 
      })
    );
  }
  
  // For 'period' or any other value, return all weighIns
  return [...weighIns];
};
