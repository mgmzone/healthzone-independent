
import { ExerciseLog } from '@/lib/types';
import { 
  isWithinInterval, 
  startOfWeek, 
  endOfWeek, 
  subWeeks, 
  isSameWeek,
  eachDayOfInterval,
  format,
  isEqual
} from 'date-fns';

export const calculateCurrentWeekExercise = (exerciseLogs: ExerciseLog[]): number => {
  if (exerciseLogs.length === 0) return 0;
  
  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);
  
  const currentWeekLogs = exerciseLogs.filter(log => {
    const logDate = new Date(log.date);
    return isWithinInterval(logDate, { start: weekStart, end: weekEnd });
  });
  
  return currentWeekLogs.reduce((sum, log) => sum + log.minutes, 0);
};

export const calculatePreviousWeekExercise = (exerciseLogs: ExerciseLog[]): number => {
  if (exerciseLogs.length === 0) return 0;
  
  const now = new Date();
  const previousWeekStart = startOfWeek(subWeeks(now, 1));
  const previousWeekEnd = endOfWeek(previousWeekStart);
  
  // Debug log to verify date range
  console.log('Previous week range:', previousWeekStart, previousWeekEnd);
  
  const previousWeekLogs = exerciseLogs.filter(log => {
    const logDate = new Date(log.date);
    
    // Debug log to see each log date being checked
    console.log('Checking log date:', logDate, 
      'Is within interval:', isWithinInterval(logDate, { start: previousWeekStart, end: previousWeekEnd }));
    
    return isWithinInterval(logDate, { 
      start: previousWeekStart, 
      end: previousWeekEnd 
    });
  });
  
  // Debug logs to inspect filtered logs and total minutes
  console.log('Previous week logs:', previousWeekLogs);
  const totalMinutes = previousWeekLogs.reduce((sum, log) => sum + log.minutes, 0);
  console.log('Total previous week minutes:', totalMinutes);
  
  return totalMinutes;
};

export const calculateAverageWeeklyExercise = (exerciseLogs: ExerciseLog[]): number => {
  if (exerciseLogs.length === 0) return 0;
  
  const now = new Date();
  const fourWeeksAgo = subWeeks(now, 4);
  
  const recentLogs = exerciseLogs.filter(log => {
    const logDate = new Date(log.date);
    return logDate >= fourWeeksAgo;
  });
  
  if (recentLogs.length === 0) return 0;
  
  const totalMinutes = recentLogs.reduce((sum, log) => sum + log.minutes, 0);
  
  return Math.round(totalMinutes / 4);
};

export const calculateExerciseGoalPercentage = (exerciseLogs: ExerciseLog[], weeklyGoal: number = 150): number => {
  const currentWeekMinutes = calculateCurrentWeekExercise(exerciseLogs);
  const percentage = (currentWeekMinutes / weeklyGoal) * 100;
  // Allow percentages over 100% without capping
  return Math.round(percentage);
};
