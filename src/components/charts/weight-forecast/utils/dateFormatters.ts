
import { format } from 'date-fns';

/**
 * Format date for display
 */
export const formatDateForDisplay = (date: Date | string | null): string => {
  if (!date) return 'Unknown';
  const dateObj = date instanceof Date ? date : new Date(date);
  return format(dateObj, 'MMM d, yyyy');
};

/**
 * Ensure a Date object from a value that might be a string or Date
 */
export const ensureDate = (dateValue: Date | string | undefined | null): Date | undefined => {
  if (!dateValue) return undefined;
  return dateValue instanceof Date ? dateValue : new Date(dateValue);
};
