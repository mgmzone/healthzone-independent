
import { ExerciseLog } from '@/lib/types';
import { format } from 'date-fns';

export function groupLogsByWeek(logs: ExerciseLog[]): Record<string, ExerciseLog[]> {
  const grouped: Record<string, ExerciseLog[]> = {};
  
  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  sortedLogs.forEach(log => {
    const logDate = new Date(log.date);
    const weekStart = new Date(logDate);
    weekStart.setDate(logDate.getDate() - logDate.getDay());
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const weekKey = `Week of ${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`;
    
    if (!grouped[weekKey]) {
      grouped[weekKey] = [];
    }
    
    grouped[weekKey].push(log);
  });
  
  return grouped;
}
