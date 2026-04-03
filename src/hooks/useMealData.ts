import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { MealLog, ProteinSource } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
import { toLocalDateString } from '@/lib/utils/dateUtils';
import {
  getMealLogs,
  addMealLog as addMealLogService,
  updateMealLog as updateMealLogService,
  deleteMealLog as deleteMealLogService,
  getProteinSources,
  addProteinSource as addProteinSourceService,
  updateProteinSource as updateProteinSourceService,
  deleteProteinSource as deleteProteinSourceService,
} from '@/lib/services/mealService';

export function useMealData() {
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [proteinSources, setProteinSources] = useState<ProteinSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [logs, sources] = await Promise.all([
          getMealLogs(),
          getProteinSources(),
        ]);
        setMealLogs(logs);
        setProteinSources(sources);
      } catch (error) {
        console.error('Error fetching meal data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load meal data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
    } else {
      setMealLogs([]);
      setProteinSources([]);
      setIsLoading(false);
    }
  }, [toast, user]);

  // Meal log handlers
  const handleAddMealLog = async (data: Partial<MealLog>) => {
    try {
      const newLog = await addMealLogService(data);
      setMealLogs(prev => [newLog, ...prev]);
      toast({
        title: 'Success',
        description: 'Meal logged successfully',
      });
      return newLog;
    } catch (error) {
      console.error('Error adding meal log:', error);
      toast({
        title: 'Error',
        description: 'Failed to add meal log',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleUpdateMealLog = async (id: string, data: Partial<MealLog>) => {
    try {
      const updatedLog = await updateMealLogService(id, data);
      setMealLogs(prev => prev.map(log =>
        log.id === id ? { ...log, ...updatedLog } : log
      ));
      toast({
        title: 'Success',
        description: 'Meal log updated successfully',
      });
      return updatedLog;
    } catch (error) {
      console.error('Error updating meal log:', error);
      toast({
        title: 'Error',
        description: 'Failed to update meal log',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleDeleteMealLog = async (id: string) => {
    try {
      await deleteMealLogService(id);
      setMealLogs(prev => prev.filter(log => log.id !== id));
      toast({
        title: 'Success',
        description: 'Meal log deleted successfully',
      });
      return true;
    } catch (error) {
      console.error('Error deleting meal log:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete meal log',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Protein source handlers
  const handleAddProteinSource = async (data: Partial<ProteinSource>) => {
    try {
      const newSource = await addProteinSourceService(data);
      setProteinSources(prev => [...prev, newSource]);
      toast({
        title: 'Success',
        description: 'Protein source added',
      });
      return newSource;
    } catch (error) {
      console.error('Error adding protein source:', error);
      toast({
        title: 'Error',
        description: 'Failed to add protein source',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleUpdateProteinSource = async (id: string, data: Partial<ProteinSource>) => {
    try {
      const updated = await updateProteinSourceService(id, data);
      setProteinSources(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
      return updated;
    } catch (error) {
      console.error('Error updating protein source:', error);
      toast({
        title: 'Error',
        description: 'Failed to update protein source',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleDeleteProteinSource = async (id: string) => {
    try {
      await deleteProteinSourceService(id);
      setProteinSources(prev => prev.filter(s => s.id !== id));
      toast({
        title: 'Success',
        description: 'Protein source removed',
      });
      return true;
    } catch (error) {
      console.error('Error deleting protein source:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove protein source',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Computed: today's meals
  const getTodaysMeals = () => {
    const today = toLocalDateString(new Date());
    return mealLogs.filter(log => toLocalDateString(new Date(log.date)) === today);
  };

  // Computed: unique meal names from recent logs (for autocomplete)
  const recentMealNames = [...new Set(mealLogs.map(log => log.mealSlot).filter(Boolean))];

  // Computed: daily protein total for a given date
  const getDailyProtein = (date: Date) => {
    const dateStr = toLocalDateString(date);
    return mealLogs
      .filter(log => toLocalDateString(new Date(log.date)) === dateStr)
      .reduce((sum, log) => sum + (log.proteinGrams || 0), 0);
  };

  return {
    mealLogs,
    proteinSources,
    isLoading,
    addMealLog: handleAddMealLog,
    updateMealLog: handleUpdateMealLog,
    deleteMealLog: handleDeleteMealLog,
    addProteinSource: handleAddProteinSource,
    updateProteinSource: handleUpdateProteinSource,
    deleteProteinSource: handleDeleteProteinSource,
    getTodaysMeals,
    getDailyProtein,
    recentMealNames,
  };
}
