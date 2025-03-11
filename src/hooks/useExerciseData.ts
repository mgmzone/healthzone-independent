import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ExerciseLog, TimeFilter, mockExerciseLogs } from '@/lib/types';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { useAuth } from '@/lib/AuthContext';
import { getExerciseLogs, addExerciseLog, deleteExerciseLog } from '@/lib/services/exerciseService';

export function useExerciseData(timeFilter: TimeFilter = 'week') {
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchExerciseLogs = async () => {
      setIsLoading(true);
      try {
        // Uncomment this when the service is ready
        // const logs = await getExerciseLogs();
        
        // For now, use mock data
        let logs = [...mockExerciseLogs];
        
        // Filter logs based on timeFilter
        logs = filterLogsByTimeFilter(logs, timeFilter);
        
        setExerciseLogs(logs);
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

    fetchExerciseLogs();
  }, [timeFilter, toast]);

  const handleAddExerciseLog = async (data: Partial<ExerciseLog>) => {
    try {
      // Uncomment this when the service is ready
      // const newLog = await addExerciseLog(data);
      
      // For now, use mock data
      const newLog: ExerciseLog = {
        id: Math.random().toString(),
        userId: user?.id || '1',
        date: data.date || new Date(),
        type: data.type || 'walk',
        minutes: data.minutes || 0,
        intensity: data.intensity || 'medium',
        steps: data.steps,
        distance: data.distance,
        lowestHeartRate: data.lowestHeartRate,
        highestHeartRate: data.highestHeartRate,
        averageHeartRate: data.averageHeartRate,
      };
      
      setExerciseLogs(prev => {
        // Only add if it fits the current time filter
        const filtered = filterLogsByTimeFilter([newLog], timeFilter);
        if (filtered.length > 0) {
          return [...prev, newLog];
        }
        return prev;
      });
      
      toast({
        title: 'Success',
        description: 'Exercise activity added successfully',
      });
    } catch (error) {
      console.error('Error adding exercise log:', error);
      toast({
        title: 'Error',
        description: 'Failed to add exercise activity',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteExerciseLog = async (id: string) => {
    try {
      // Uncomment this when the service is ready
      // await deleteExerciseLog(id);
      
      setExerciseLogs(prev => prev.filter(log => log.id !== id));
      
      toast({
        title: 'Success',
        description: 'Exercise activity deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting exercise log:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete exercise activity',
        variant: 'destructive',
      });
    }
  };

  return {
    exerciseLogs,
    isLoading,
    addExerciseLog: handleAddExerciseLog,
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
