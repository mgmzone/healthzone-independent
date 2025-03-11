
import { differenceInSeconds } from 'date-fns';
import { FastingLog } from '@/lib/types';

// Calculate duration between start and end time
export const calculateDuration = (startTime: Date, endTime?: Date) => {
  if (!endTime) return '-';
  
  const durationInSeconds = differenceInSeconds(
    new Date(endTime),
    new Date(startTime)
  );
  
  const hours = Math.floor(durationInSeconds / 3600);
  const minutes = Math.floor((durationInSeconds % 3600) / 60);
  
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
};

// Helper function to get ISO week number
export const getISOWeek = (date: Date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

// Group logs by week
export const groupLogsByWeek = (fastingLogs: FastingLog[]) => {
  const weeks: { [key: string]: FastingLog[] } = {};
  
  fastingLogs.forEach(log => {
    const startDate = new Date(log.startTime);
    const weekNumber = getISOWeek(startDate);
    const year = startDate.getFullYear();
    const weekKey = `${year}-W${weekNumber}`;
    
    if (!weeks[weekKey]) {
      weeks[weekKey] = [];
    }
    
    weeks[weekKey].push(log);
  });
  
  return weeks;
};
