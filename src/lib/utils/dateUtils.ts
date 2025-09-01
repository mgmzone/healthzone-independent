
import { differenceInDays, differenceInWeeks, differenceInMonths, format } from "date-fns";

export const formatDate = (date: Date, formatStr: string): string => {
  return format(date, formatStr);
};

export const getWeeksInPeriod = (startDate: Date | string, endDate: Date | string | undefined): number => {
  const start = ensureDate(startDate);
  const end = ensureDate(endDate);
  if (!end || !start) return 0;
  
  // Calculate weeks and round up to nearest whole number
  return Math.ceil(differenceInWeeks(end, start));
};

export const getMonthsInPeriod = (startDate: Date | string, endDate: Date | string | undefined): number => {
  const start = ensureDate(startDate);
  const end = ensureDate(endDate);
  if (!end || !start) return 0;
  
  // Calculate months and round to nearest whole number
  return Math.round(differenceInMonths(end, start));
};

export const getTimeProgressPercentage = (startDate: Date | string, endDate: Date | string | undefined, projectedEndDate?: Date | string | undefined): number => {
  const start = ensureDate(startDate);
  // Use projected end date for calculation if available
  const end = ensureDate(projectedEndDate || endDate);
  
  if (!start || !end) return 0;
  
  const today = new Date();
  if (today < start) return 0;
  if (today > end) return 100;
  
  const totalDays = differenceInDays(end, start);
  const daysPassed = differenceInDays(today, start);
  
  // Ensure we don't return negative values or values over 100
  return Math.min(Math.max(Math.round((daysPassed / totalDays) * 100), 0), 100);
};

export const getRemainingTimePercentage = (startDate: Date | string, endDate: Date | string | undefined, projectedEndDate?: Date | string | undefined): number => {
  if (!endDate && !projectedEndDate) return 100;
  
  const timeProgress = getTimeProgressPercentage(startDate, endDate, projectedEndDate);
  return 100 - timeProgress;
};

export const getDaysRemaining = (endDate: Date | string | undefined, projectedEndDate?: Date | string | undefined): number => {
  // Use projected end date for calculation if available
  const end = ensureDate(projectedEndDate || endDate);
  if (!end) return 0;
  
  const today = new Date();
  if (today > end) return 0;
  
  return differenceInDays(end, today);
};

// Helper to ensure we always have a Date object
export const ensureDate = (dateValue: Date | string | undefined | null): Date | undefined => {
  if (!dateValue) return undefined;
  const d = dateValue instanceof Date ? dateValue : new Date(dateValue);
  return isNaN(d.getTime()) ? undefined : d;
};
