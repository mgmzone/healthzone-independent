
/**
 * Format durations into human-readable strings
 */
export const formatDuration = (hours: number) => {
  if (!hours || hours === 0) return '0h';
  
  const days = Math.floor(hours / 24);
  const remainingHours = Math.floor(hours % 24);
  
  if (days > 0) {
    return `${days}d ${remainingHours}h`;
  }
  return `${remainingHours}h`;
};
