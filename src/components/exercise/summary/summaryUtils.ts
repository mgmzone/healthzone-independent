
import { ExerciseLog, TimeFilter } from '@/lib/types';
import { format, startOfWeek, endOfWeek, startOfMonth, differenceInDays } from 'date-fns';

export function getTimePeriodText(timeFilter: TimeFilter): string {
  switch (timeFilter) {
    case 'week': return 'This week';
    case 'month': return 'This month';
    case 'period': return 'Current period';
    default: return 'Selected period';
  }
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

export function prepareChartData(logs: ExerciseLog[], timeFilter: TimeFilter) {
  const today = new Date();
  const data: any[] = [];
  
  if (timeFilter === 'week') {
    // Create data for each day of the current week
    const startDate = startOfWeek(today);
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const dayLogs = logs.filter(log => {
        const logDate = new Date(log.date);
        return logDate.getDate() === date.getDate() && 
               logDate.getMonth() === date.getMonth() && 
               logDate.getFullYear() === date.getFullYear();
      });
      
      data.push({
        name: format(date, 'EEE'),
        minutes: dayLogs.reduce((sum, log) => sum + log.minutes, 0),
        distance: dayLogs.reduce((sum, log) => sum + (log.distance || 0), 0).toFixed(1),
        walk: dayLogs.filter(log => log.type === 'walk').reduce((sum, log) => sum + log.minutes, 0),
        run: dayLogs.filter(log => log.type === 'run').reduce((sum, log) => sum + log.minutes, 0),
        bike: dayLogs.filter(log => log.type === 'bike').reduce((sum, log) => sum + log.minutes, 0),
        elliptical: dayLogs.filter(log => log.type === 'elliptical').reduce((sum, log) => sum + log.minutes, 0),
        other: dayLogs.filter(log => log.type === 'other').reduce((sum, log) => sum + log.minutes, 0),
      });
    }
  } else if (timeFilter === 'month') {
    // Create weekly data for the current month
    const startDate = startOfMonth(today);
    const weeks = Math.ceil(differenceInDays(today, startDate) / 7) + 1;
    
    for (let i = 0; i < weeks; i++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(weekStart.getDate() + (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const weekLogs = logs.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= weekStart && logDate <= weekEnd;
      });
      
      data.push({
        name: `Week ${i + 1}`,
        minutes: weekLogs.reduce((sum, log) => sum + log.minutes, 0),
        distance: weekLogs.reduce((sum, log) => sum + (log.distance || 0), 0).toFixed(1),
        walk: weekLogs.filter(log => log.type === 'walk').reduce((sum, log) => sum + log.minutes, 0),
        run: weekLogs.filter(log => log.type === 'run').reduce((sum, log) => sum + log.minutes, 0),
        bike: weekLogs.filter(log => log.type === 'bike').reduce((sum, log) => sum + log.minutes, 0),
        elliptical: weekLogs.filter(log => log.type === 'elliptical').reduce((sum, log) => sum + log.minutes, 0),
        other: weekLogs.filter(log => log.type === 'other').reduce((sum, log) => sum + log.minutes, 0),
      });
    }
  }
  
  return data;
}
