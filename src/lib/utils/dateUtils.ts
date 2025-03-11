
import { differenceInDays, differenceInWeeks, differenceInMonths } from "date-fns";

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
  
  return Math.round((daysPassed / totalDays) * 100);
};
