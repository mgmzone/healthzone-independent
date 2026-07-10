import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Milestone } from '@/lib/types';
import {
  getMilestones,
  addMilestone as addMilestoneApi,
  updateMilestone as updateMilestoneApi,
  deleteMilestone as deleteMilestoneApi,
  setPriorityMilestone as setPriorityMilestoneApi,
  clearPriorityMilestone as clearPriorityMilestoneApi,
} from '@/lib/services/milestonesService';
import { useToast } from '@/hooks/use-toast';

// User-level milestones (no longer scoped to a weight-loss period).
export function useMilestones() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: milestones = [], isLoading } = useQuery({
    queryKey: ['milestones'],
    queryFn: getMilestones,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['milestones'] });

  const addMilestone = async (input: {
    name: string;
    type: string;
    date: string;
    isPriority?: boolean;
    notes?: string;
  }) => {
    try {
      await addMilestoneApi(input);
      toast({ title: 'Milestone added' });
      invalidate();
    } catch (err: any) {
      toast({ title: 'Failed to add milestone', description: err.message, variant: 'destructive' });
    }
  };

  const updateMilestone = async (
    id: string,
    updates: Partial<Pick<Milestone, 'name' | 'type' | 'date' | 'notes'>>,
  ) => {
    try {
      await updateMilestoneApi(id, updates);
      toast({ title: 'Milestone updated' });
      invalidate();
    } catch (err: any) {
      toast({ title: 'Failed to update milestone', description: err.message, variant: 'destructive' });
    }
  };

  const deleteMilestone = async (id: string) => {
    try {
      await deleteMilestoneApi(id);
      toast({ title: 'Milestone deleted' });
      invalidate();
    } catch (err: any) {
      toast({ title: 'Failed to delete milestone', description: err.message, variant: 'destructive' });
    }
  };

  const setPriority = async (id: string) => {
    try {
      await setPriorityMilestoneApi(id);
      invalidate();
    } catch (err: any) {
      toast({ title: 'Failed to set priority', description: err.message, variant: 'destructive' });
    }
  };

  const clearPriority = async () => {
    try {
      await clearPriorityMilestoneApi();
      invalidate();
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
    refetch: invalidate,
  };
}
