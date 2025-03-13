
import { differenceInSeconds, differenceInDays, startOfWeek, endOfWeek } from 'date-fns';
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
  
  if (!fastingLogs.length) return weeks;
  
  // Define the reference start date for the first week
  // This assumes starting from 2/23/2025, but we'll try to guess from the logs if available
  let referenceStartDate = new Date(2025, 1, 23); // 2/23/2025
  
  // Find the earliest date in the logs to use as our reference point, if it's earlier than our default
  const sortedByOldestFirst = [...fastingLogs].sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
  
  if (sortedByOldestFirst.length > 0) {
    const earliestLogDate = new Date(sortedByOldestFirst[0].startTime);
    // Use the start of the week for the earliest log as the reference date
    const weekStart = startOfWeek(earliestLogDate, { weekStartsOn: 0 }); // 0 = Sunday
    
    // Only update if our earliest log is before the default reference date
    if (weekStart < referenceStartDate) {
      referenceStartDate = weekStart;
    }
  }
  
  fastingLogs.forEach(log => {
    const startDate = new Date(log.startTime);
    
    // Calculate days since reference date
    const daysSinceStart = differenceInDays(startDate, referenceStartDate);
    
    // Calculate which week number this falls into (1-based)
    const weekNumber = Math.floor(daysSinceStart / 7) + 1;
    
    // Create a key for this week
    const weekKey = `Week ${weekNumber}`;
    
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

// Helper function to calculate eating window hours
export const calculateEatingWindowHours = (fastingHours: number): number => {
  // For fasts that span 24 hours or more, the eating window should be 0
  // This is because if someone fasts for 24+ hours, they didn't eat that day
  if (fastingHours >= 24) {
    return 0;
  }
  
  // For normal fasts, just return 24 - fasting hours
  return Math.max(0, 24 - fastingHours);
};
