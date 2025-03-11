
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ExerciseLog, TimeFilter } from '@/lib/types';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { useAuth } from '@/lib/AuthContext';
import { 
  getExerciseLogs, 
  addExerciseLog as addExerciseLogService, 
  deleteExerciseLog as deleteExerciseLogService,
  updateExerciseLog as updateExerciseLogService 
} from '@/lib/services/exerciseService';

export function useExerciseData(timeFilter: TimeFilter = 'week') {
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchExerciseLogs = async () => {
      setIsLoading(true);
      try {
        const logs = await getExerciseLogs();
        
        // Filter logs based on timeFilter
        const filteredLogs = filterLogsByTimeFilter(logs, timeFilter);
        
        setExerciseLogs(filteredLogs);
      } catch (error) {
        console.error('Error fetching exercise logs:', error);
        toast({
          title: 'Error',
          description: 'Failed to load exercise data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchExerciseLogs();
    } else {
      setExerciseLogs([]);
      setIsLoading(false);
    }
  }, [timeFilter, toast, user]);

  const handleAddExerciseLog = async (data: Partial<ExerciseLog>) => {
    try {
      const newLog = await addExerciseLogService(data);
      
      // Only add to the current state if it matches the timeFilter
      const filtered = filterLogsByTimeFilter([newLog], timeFilter);
      
      if (filtered.length > 0) {
        setExerciseLogs(prev => [newLog, ...prev]);
      }
      
      toast({
        title: 'Success',
        description: 'Exercise activity added successfully',
      });
      
      return newLog;
    } catch (error) {
      console.error('Error adding exercise log:', error);
      toast({
        title: 'Error',
        description: 'Failed to add exercise activity',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleUpdateExerciseLog = async (id: string, data: Partial<ExerciseLog>) => {
    try {
      const updatedLog = await updateExerciseLogService(id, data);
      
      // Update the log in the current state
      setExerciseLogs(prev => prev.map(log => 
        log.id === id ? { ...log, ...updatedLog } : log
      ));
      
      toast({
        title: 'Success',
        description: 'Exercise activity updated successfully',
      });
      
      return updatedLog;
    } catch (error) {
      console.error('Error updating exercise log:', error);
      toast({
        title: 'Error',
        description: 'Failed to update exercise activity',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleDeleteExerciseLog = async (id: string) => {
    try {
      await deleteExerciseLogService(id);
      
      setExerciseLogs(prev => prev.filter(log => log.id !== id));
      
      toast({
        title: 'Success',
        description: 'Exercise activity deleted successfully',
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting exercise log:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete exercise activity',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    exerciseLogs,
    isLoading,
    addExerciseLog: handleAddExerciseLog,
    updateExerciseLog: handleUpdateExerciseLog,
    deleteExerciseLog: handleDeleteExerciseLog,
  };
}

function filterLogsByTimeFilter(logs: ExerciseLog[], timeFilter: TimeFilter): ExerciseLog[] {
  const today = new Date();
  
  return logs.filter(log => {
    const logDate = new Date(log.date);
    
    if (timeFilter === 'week') {
      const weekStart = startOfWeek(today);
      const weekEnd = endOfWeek(today);
      return isWithinInterval(logDate, { start: weekStart, end: weekEnd });
    } else if (timeFilter === 'month') {
      const monthStart = startOfMonth(today);
      const monthEnd = endOfMonth(today);
      return isWithinInterval(logDate, { start: monthStart, end: monthEnd });
    }
    
    // For 'period', keep all logs (will be filtered by period ID in a real implementation)
    return true;
  });
}
