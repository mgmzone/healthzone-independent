
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useFastingQueries } from './fasting/useFastingQueries';
import { useFastingMutations } from './fasting/useFastingMutations';

export const useFastingData = () => {
  const { toast } = useToast();
  const { fastingLogs, isLoading, activeFast } = useFastingQueries();
  
  const { 
    startFastMutation,
    endFastMutation,
    addFastMutation,
    updateFastMutation,
    deleteFastMutation,
    isDeleting,
    setIsDeleting
  } = useFastingMutations(activeFast);

  // Wrap mutations in callback functions for easier use
  const startFast = useCallback(() => {
    if (activeFast) {
      toast({
        title: 'Fast already in progress',
        description: 'End your current fast before starting a new one',
        variant: 'destructive',
      });
      return;
    }
    startFastMutation.mutate();
  }, [activeFast, startFastMutation, toast]);

  const endFast = useCallback(() => {
    if (!activeFast) {
      toast({
        title: 'No active fast',
        description: 'You need to start a fast first',
        variant: 'destructive',
      });
      return;
    }
    endFastMutation.mutate();
  }, [activeFast, endFastMutation, toast]);

  const addFast = useCallback((fastData: {
    startTime: Date;
    endTime?: Date;
    fastingHours?: number;
    eatingWindowHours?: number;
  }) => {
    addFastMutation.mutate(fastData);
  }, [addFastMutation]);

  const updateFast = useCallback((
    id: string,
    data: {
      startTime: Date;
      endTime?: Date;
      fastingHours?: number;
      eatingWindowHours?: number;
    }
  ) => {
    updateFastMutation.mutate({ id, data });
  }, [updateFastMutation]);

  const deleteFast = useCallback((id: string) => {
    deleteFastMutation.mutate(id);
  }, [deleteFastMutation]);

  return {
    fastingLogs,
    isLoading,
    activeFast,
    startFast,
    endFast,
    addFast,
    updateFast,
    deleteFast
  };
};
