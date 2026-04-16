import { useCallback, useEffect, useState } from 'react';
import { PeriodMilestone } from '@/lib/types';
import {
  getMilestones,
  addMilestone as addMilestoneApi,
  updateMilestone as updateMilestoneApi,
  deleteMilestone as deleteMilestoneApi,
  setPriorityMilestone as setPriorityMilestoneApi,
  clearPriorityMilestone as clearPriorityMilestoneApi,
} from '@/lib/services/milestonesService';
import { useToast } from '@/hooks/use-toast';

export function useMilestones(periodId: string | undefined) {
  const [milestones, setMilestones] = useState<PeriodMilestone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    if (!periodId) {
      setMilestones([]);
      return;
    }
    setIsLoading(true);
    try {
      const data = await getMilestones(periodId);
      setMilestones(data);
    } finally {
      setIsLoading(false);
    }
  }, [periodId]);

  useEffect(() => {
    load();
  }, [load]);

  const addMilestone = async (input: {
    name: string;
    date: string;
    isPriority: boolean;
    notes?: string;
  }) => {
    if (!periodId) return;
    try {
      await addMilestoneApi({ periodId, ...input });
      toast({ title: 'Milestone added' });
      await load();
    } catch (err: any) {
      toast({ title: 'Failed to add milestone', description: err.message, variant: 'destructive' });
    }
  };

  const updateMilestone = async (
    id: string,
    updates: { name?: string; date?: string; notes?: string },
  ) => {
    try {
      await updateMilestoneApi(id, updates);
      toast({ title: 'Milestone updated' });
      await load();
    } catch (err: any) {
      toast({ title: 'Failed to update milestone', description: err.message, variant: 'destructive' });
    }
  };

  const deleteMilestone = async (id: string) => {
    try {
      await deleteMilestoneApi(id);
      toast({ title: 'Milestone deleted' });
      await load();
    } catch (err: any) {
      toast({ title: 'Failed to delete milestone', description: err.message, variant: 'destructive' });
    }
  };

  const setPriority = async (id: string) => {
    if (!periodId) return;
    try {
      await setPriorityMilestoneApi(id, periodId);
      await load();
    } catch (err: any) {
      toast({ title: 'Failed to set priority', description: err.message, variant: 'destructive' });
    }
  };

  const clearPriority = async () => {
    if (!periodId) return;
    try {
      await clearPriorityMilestoneApi(periodId);
      await load();
    } catch (err: any) {
      toast({ title: 'Failed to clear priority', description: err.message, variant: 'destructive' });
    }
  };

  return {
    milestones,
    isLoading,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    setPriority,
    clearPriority,
    refetch: load,
  };
}
