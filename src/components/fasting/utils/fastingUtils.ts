
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

// Format duration for display
export const formatFastingDuration = (hours: number) => {
  if (hours === 0) return '0h';
  
  const days = Math.floor(hours / 24);
  const remainingHours = Math.floor(hours % 24);
  
  if (days > 0) {
    return `${days}d ${remainingHours}h`;
  }
  return `${remainingHours}h`;
};

// Calculate fasting statistics for a time period
export const calculateFastingStats = (fastingLogs: FastingLog[]) => {
  // Calculate total fasting time in hours
  const totalFastingHours = fastingLogs.reduce((total, log) => {
    if (!log.endTime) return total;
    
    const startTime = new Date(log.startTime);
    const endTime = new Date(log.endTime);
    const fastDurationInSeconds = differenceInSeconds(endTime, startTime);
    return total + (fastDurationInSeconds / 3600);
  }, 0);
  
  // Find longest fast
  let longestFastHours = 0;
  fastingLogs.forEach(log => {
    if (!log.endTime) return;
    
    const startTime = new Date(log.startTime);
    const endTime = new Date(log.endTime);
    const fastDurationInHours = differenceInSeconds(endTime, startTime) / 3600;
    
    if (fastDurationInHours > longestFastHours) {
      longestFastHours = fastDurationInHours;
    }
  });
  
  return {
    totalFastingTime: totalFastingHours,
    longestFast: longestFastHours,
    totalFasts: fastingLogs.filter(log => log.endTime).length
  };
};
