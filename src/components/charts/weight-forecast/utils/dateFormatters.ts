
import { format } from 'date-fns';

/**
 * Format date for display
 */
export const formatDateForDisplay = (date: Date | null): string => {
  if (!date) return 'Unknown';
  return format(date, 'MMM d, yyyy');
};
