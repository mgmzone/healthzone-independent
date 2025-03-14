
import { format } from 'date-fns';
import { ensureDate } from '@/lib/utils/dateUtils';

/**
 * Format date for display
 */
export const formatDateForDisplay = (date: Date | string | null): string => {
  if (!date) return 'Unknown';
  const dateObj = ensureDate(date);
  return dateObj ? format(dateObj, 'MMM d, yyyy') : 'Unknown';
};

// Use the shared ensureDate function from dateUtils
export { ensureDate } from '@/lib/utils/dateUtils';
