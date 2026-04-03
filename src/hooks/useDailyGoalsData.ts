import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { DailyGoal, DailyGoalEntry } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
import {
  getDailyGoals,
  addDailyGoal as addDailyGoalService,
  updateDailyGoal as updateDailyGoalService,
  deleteDailyGoal as deleteDailyGoalService,
  getDailyGoalEntries,
  upsertDailyGoalEntry as upsertEntryService,
} from '@/lib/services/dailyGoalsService';
import { subDays } from 'date-fns';
import { toLocalDateString } from '@/lib/utils/dateUtils';

export function useDailyGoalsData() {
  const [goals, setGoals] = useState<DailyGoal[]>([]);
  const [entries, setEntries] = useState<DailyGoalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch goals and last 90 days of entries
        const startDate = toLocalDateString(subDays(new Date(), 90));
        const [goalsData, entriesData] = await Promise.all([
          getDailyGoals(),
          getDailyGoalEntries(startDate),
        ]);
        setGoals(goalsData);
        setEntries(entriesData);
      } catch (error) {
        console.error('Error fetching daily goals data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load daily goals',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
    } else {
      setGoals([]);
      setEntries([]);
      setIsLoading(false);
    }
  }, [toast, user]);

  // Goal CRUD
  const handleAddGoal = async (data: Partial<DailyGoal>) => {
    try {
      const newGoal = await addDailyGoalService(data);
      setGoals(prev => [...prev, newGoal]);
      toast({
        title: 'Success',
        description: 'Daily goal added',
      });
      return newGoal;
    } catch (error) {
      console.error('Error adding daily goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to add daily goal',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleUpdateGoal = async (id: string, data: Partial<DailyGoal>) => {
    try {
      const updated = await updateDailyGoalService(id, data);
      setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updated } : g));
      toast({
        title: 'Success',
        description: 'Daily goal updated',
      });
      return updated;
    } catch (error) {
      console.error('Error updating daily goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to update daily goal',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await deleteDailyGoalService(id);
      setGoals(prev => prev.filter(g => g.id !== id));
      setEntries(prev => prev.filter(e => e.goalId !== id));
      toast({
        title: 'Success',
        description: 'Daily goal removed',
      });
      return true;
    } catch (error) {
      console.error('Error deleting daily goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove daily goal',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Entry toggle (check/uncheck)
  const handleToggleEntry = async (goalId: string, date: Date, met: boolean, notes?: string) => {
    try {
      const result = await upsertEntryService({ goalId, date, met, notes });
      setEntries(prev => {
        const dateStr = toLocalDateString(date);
        const existing = prev.findIndex(
          e => e.goalId === goalId && toLocalDateString(new Date(e.date)) === dateStr
        );
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = result;
          return updated;
        }
        return [result, ...prev];
      });
      return result;
    } catch (error) {
      console.error('Error toggling goal entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to update goal status',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Computed: get entries for a specific date
  const getEntriesForDate = useCallback((date: Date) => {
    const dateStr = toLocalDateString(date);
    return entries.filter(e => toLocalDateString(new Date(e.date)) === dateStr);
  }, [entries]);

  // Computed: active goals only
  const activeGoals = goals.filter(g => g.isActive);

  // Computed: streak calculation for a specific goal
  const getGoalStreak = useCallback((goalId: string) => {
    const goalEntries = entries
      .filter(e => e.goalId === goalId && e.met)
      .map(e => toLocalDateString(new Date(e.date)))
      .sort()
      .reverse();

    if (goalEntries.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    let checkDate = new Date(today);

    // Check if today or yesterday has an entry (allow for not-yet-logged today)
    const todayStr = toLocalDateString(today);
    const yesterdayStr = toLocalDateString(subDays(today, 1));

    if (!goalEntries.includes(todayStr) && !goalEntries.includes(yesterdayStr)) {
      return 0;
    }

    // If today isn't logged yet, start from yesterday
    if (!goalEntries.includes(todayStr)) {
      checkDate = subDays(today, 1);
    }

    while (true) {
      const dateStr = toLocalDateString(checkDate);
      if (goalEntries.includes(dateStr)) {
        streak++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }

    return streak;
  }, [entries]);

  // Computed: perfect day streak (all active goals met)
  const getPerfectDayStreak = useCallback(() => {
    if (activeGoals.length === 0) return 0;

    const today = new Date();
    let streak = 0;
    let checkDate = new Date(today);

    // Build a map of date -> set of met goal IDs
    const dateGoalMap = new Map<string, Set<string>>();
    entries.filter(e => e.met).forEach(e => {
      const dateStr = toLocalDateString(new Date(e.date));
      if (!dateGoalMap.has(dateStr)) {
        dateGoalMap.set(dateStr, new Set());
      }
      dateGoalMap.get(dateStr)!.add(e.goalId);
    });

    const activeGoalIds = new Set(activeGoals.map(g => g.id));
    const todayStr = toLocalDateString(today);

    // If today isn't complete, start from yesterday
    const todayMet = dateGoalMap.get(todayStr);
    const todayPerfect = todayMet && activeGoalIds.size > 0 &&
      [...activeGoalIds].every(id => todayMet.has(id));

    if (!todayPerfect) {
      checkDate = subDays(today, 1);
    }

    while (true) {
      const dateStr = toLocalDateString(checkDate);
      const metGoals = dateGoalMap.get(dateStr);

      if (metGoals && [...activeGoalIds].every(id => metGoals.has(id))) {
        streak++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }

    return streak;
  }, [entries, activeGoals]);

  // Computed: today's compliance rate
  const getTodayCompliance = useCallback(() => {
    if (activeGoals.length === 0) return { met: 0, total: 0, rate: 0 };
    const todayEntries = getEntriesForDate(new Date());
    const met = todayEntries.filter(e => e.met).length;
    return {
      met,
      total: activeGoals.length,
      rate: Math.round((met / activeGoals.length) * 100),
    };
  }, [activeGoals, getEntriesForDate]);

  return {
    goals,
    activeGoals,
    entries,
    isLoading,
    addGoal: handleAddGoal,
    updateGoal: handleUpdateGoal,
    deleteGoal: handleDeleteGoal,
    toggleEntry: handleToggleEntry,
    getEntriesForDate,
    getGoalStreak,
    getPerfectDayStreak,
    getTodayCompliance,
  };
}
