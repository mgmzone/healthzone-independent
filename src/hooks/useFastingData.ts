
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { FastingLog } from '@/lib/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getFastingLogs, 
  getCurrentFasting, 
  startFasting as startFastingService, 
  endFasting as endFastingService,
  addFastingLog,
  updateFastingLog,
  deleteFastingLog
} from '@/lib/services/fastingService';

export const useFastingData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeFast, setActiveFast] = useState<FastingLog | null>(null);

  // Query for fasting logs
  const { data: fastingLogs = [], isLoading } = useQuery({
    queryKey: ['fastingLogs'],
    queryFn: () => getFastingLogs(),
    enabled: !!user,
  });

  // Query for active fast
  const { data: currentFast, isLoading: isLoadingCurrentFast } = useQuery({
    queryKey: ['currentFast'],
    queryFn: () => getCurrentFasting(),
    enabled: !!user,
  });

  // Update active fast when current fast changes
  useEffect(() => {
    setActiveFast(currentFast || null);
  }, [currentFast]);

  // Start a new fast
  const startFastMutation = useMutation({
    mutationFn: () => startFastingService(),
    onSuccess: (newFast) => {
      queryClient.invalidateQueries({ queryKey: ['fastingLogs'] });
      queryClient.invalidateQueries({ queryKey: ['currentFast'] });
      setActiveFast(newFast);
      toast({
        title: 'Fast started',
        description: `Your fast has started at ${new Date(newFast.startTime).toLocaleTimeString()}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error starting fast',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    }
  });

  // End the current fast
  const endFastMutation = useMutation({
    mutationFn: () => {
      if (!activeFast) throw new Error('No active fast');
      return endFastingService(activeFast.id);
    },
    onSuccess: (updatedFast) => {
      queryClient.invalidateQueries({ queryKey: ['fastingLogs'] });
      queryClient.invalidateQueries({ queryKey: ['currentFast'] });
      setActiveFast(null);
      toast({
        title: 'Fast completed',
        description: `Your fast has ended at ${new Date().toLocaleTimeString()}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error ending fast',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    }
  });

  // Add a past fast
  const addFastMutation = useMutation({
    mutationFn: (fastData: {
      startTime: Date;
      endTime?: Date;
      fastingHours?: number;
      eatingWindowHours?: number;
    }) => addFastingLog(fastData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fastingLogs'] });
      toast({
        title: 'Fast added',
        description: 'Your fast has been added successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error adding fast',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    }
  });

  // Update a fast
  const updateFastMutation = useMutation({
    mutationFn: ({ 
      id, 
      data 
    }: { 
      id: string; 
      data: {
        startTime: Date;
        endTime?: Date;
        fastingHours?: number;
        eatingWindowHours?: number;
      }
    }) => updateFastingLog(id, data),
    onSuccess: (updatedFast) => {
      queryClient.invalidateQueries({ queryKey: ['fastingLogs'] });
      // If the updated fast is the active one, update it
      if (activeFast && activeFast.id === updatedFast.id) {
        if (!updatedFast.endTime) {
          setActiveFast(updatedFast);
        } else {
          setActiveFast(null);
          queryClient.invalidateQueries({ queryKey: ['currentFast'] });
        }
      }
      toast({
        title: 'Fast updated',
        description: 'The fast has been updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating fast',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    }
  });

  // Delete a fast
  const deleteFastMutation = useMutation({
    mutationFn: (id: string) => deleteFastingLog(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['fastingLogs'] });
      // If the deleted fast is the active one, clear it
      if (activeFast && activeFast.id === id) {
        setActiveFast(null);
        queryClient.invalidateQueries({ queryKey: ['currentFast'] });
      }
      toast({
        title: 'Fast deleted',
        description: 'The fast has been deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error deleting fast',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    }
  });

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
    isLoading: isLoading || isLoadingCurrentFast,
    activeFast,
    startFast,
    endFast,
    addFast,
    updateFast,
    deleteFast
  };
};
