import { differenceInDays, differenceInWeeks, differenceInMonths, format } from "date-fns";

export const formatDate = (date: Date, formatStr: string): string => {
  return format(date, formatStr);
};

export const getWeeksInPeriod = (startDate: Date, endDate: Date | undefined): number => {
  if (!endDate) return 0;
  return Math.ceil(differenceInWeeks(endDate, startDate));
};

export const getMonthsInPeriod = (startDate: Date, endDate: Date | undefined): number => {
  if (!endDate) return 0;
  return Math.ceil(differenceInMonths(endDate, startDate));
};

export const getTimeProgressPercentage = (startDate: Date, endDate: Date | undefined): number => {
  if (!endDate) return 0;
  
  const today = new Date();
  if (today < startDate) return 0;
  if (today > endDate) return 100;
  
  const totalDays = differenceInDays(endDate, startDate);
  const daysPassed = differenceInDays(today, startDate);
  
  // Ensure we don't return negative values or values over 100
  return Math.min(Math.max(Math.round((daysPassed / totalDays) * 100), 0), 100);
};

export const getRemainingTimePercentage = (startDate: Date, endDate: Date | undefined): number => {
  if (!endDate) return 100;
  
  const timeProgress = getTimeProgressPercentage(startDate, endDate);
  return 100 - timeProgress;
};

export const getDaysRemaining = (endDate: Date | undefined): number => {
  if (!endDate) return 0;
  
  const today = new Date();
  if (today > endDate) return 0;
  
  return differenceInDays(endDate, today);
};
