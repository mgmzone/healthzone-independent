
import { ExerciseLog } from '@/lib/types';
import { isWithinInterval, startOfWeek, endOfWeek, subWeeks, isSameWeek } from 'date-fns';

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
  
  const previousWeekLogs = exerciseLogs.filter(log => {
    const logDate = new Date(log.date);
    return isSameWeek(logDate, previousWeekStart);
  });
  
  return previousWeekLogs.reduce((sum, log) => sum + log.minutes, 0);
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

export const calculateExerciseGoalPercentage = (exerciseLogs: ExerciseLog[]): number => {
  const weeklyGoal = 150;
  const currentWeekMinutes = calculateCurrentWeekExercise(exerciseLogs);
  const percentage = (currentWeekMinutes / weeklyGoal) * 100;
  return Math.min(Math.round(percentage), 100);
};
