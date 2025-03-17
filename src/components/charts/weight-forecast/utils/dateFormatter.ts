
/**
 * Simple formatter for display
 */
export const formatDateForDisplay = (date: Date | null): string => {
  if (!date) return 'Unknown';
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  }).format(date);
};
