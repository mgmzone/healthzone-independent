
import { Period } from '@/lib/types';
import { format } from 'date-fns';

export const getEndDateForDisplay = (currentPeriod?: Period): Date | undefined => {
  if (!currentPeriod) return undefined;
  
  if (currentPeriod.projectedEndDate) {
    return new Date(currentPeriod.projectedEndDate);
  }
  
  return currentPeriod.endDate ? new Date(currentPeriod.endDate) : undefined;
};

export const getRemainingDaysForDisplay = (
  currentPeriod?: Period, 
  getDaysRemaining: (date: Date, projectedEndDate?: Date | string | undefined) => number
): string => {
  if (!currentPeriod) return "No active period";
  
  const endDate = getEndDateForDisplay(currentPeriod);
  if (!endDate) return "Ongoing";
  
  const days = getDaysRemaining(endDate);
  if (days > 365) return `${Math.round(days / 365)} years`;
  if (days > 90) return `${Math.round(days / 30)} months`;
  if (days <= 0) return "Completed";
  
  return `${days} days left`;
};

export const getEndDateFormatted = (currentPeriod?: Period): string => {
  const endDate = getEndDateForDisplay(currentPeriod);
  if (!endDate) return "";
  
  return format(endDate, 'MMM d, yyyy');
};

export const getStartDateFormatted = (currentPeriod?: Period): string => {
  if (!currentPeriod || !currentPeriod.startDate) return "Not set";
  
  const startDate = new Date(currentPeriod.startDate);
  return format(startDate, 'MMM d, yyyy');
};
