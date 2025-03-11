
import { ExerciseGoal } from '@/hooks/useExerciseGoals';
import { ExerciseLog } from '@/lib/types';
import { startOfDay, startOfWeek, startOfMonth, isWithinInterval, endOfDay, endOfWeek, endOfMonth } from 'date-fns';

export const processGoalsWithProgress = (goals: ExerciseGoal[], exerciseLogs: ExerciseLog[]): ExerciseGoal[] => {
  return goals.map(goal => {
    let current = 0;
    const now = new Date();
    
    let periodStart, periodEnd;
    
    switch(goal.period) {
      case 'daily':
        periodStart = startOfDay(now);
        periodEnd = endOfDay(now);
        break;
      case 'weekly':
        periodStart = startOfWeek(now);
        periodEnd = endOfWeek(now);
        break;
      case 'monthly':
        periodStart = startOfMonth(now);
        periodEnd = endOfMonth(now);
        break;
    }
    
    const logsInPeriod = exerciseLogs.filter(log => {
      const logDate = new Date(log.date);
      return isWithinInterval(logDate, { start: periodStart, end: periodEnd });
    });
    
    switch(goal.type) {
      case 'steps':
        current = logsInPeriod.reduce((sum, log) => sum + (log.steps || 0), 0);
        break;
      case 'distance':
        current = logsInPeriod.reduce((sum, log) => sum + (log.distance || 0), 0);
        break;
      case 'minutes':
        current = logsInPeriod.reduce((sum, log) => sum + log.minutes, 0);
        break;
      default:
        current = 0;
    }
    
    return { ...goal, current };
  });
};
