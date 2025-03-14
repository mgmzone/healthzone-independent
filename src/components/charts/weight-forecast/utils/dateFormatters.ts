
import { format } from 'date-fns';

/**
 * Format date for display
 */
export const formatDateForDisplay = (date: Date | null): string => {
  if (!date) return 'Unknown';
  return format(date, 'MMM d, yyyy');
};

/**
 * Ensure a Date object from a value that might be a string or Date
 */
export const ensureDate = (dateValue: Date | string | undefined | null): Date | undefined => {
  if (!dateValue) return undefined;
  return dateValue instanceof Date ? dateValue : new Date(dateValue);
};
