
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FastingLog } from '@/lib/types';
import { 
  startFasting as startFastingService, 
  endFasting as endFastingService,
  addFastingLog,
  updateFastingLog,
  deleteFastingLog
} from '@/lib/services/fasting';

export const useFastingMutations = (activeFast: FastingLog | null) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Start a new fast
  const startFastMutation = useMutation({
    mutationFn: () => startFastingService(),
    onSuccess: (newFast) => {
      queryClient.invalidateQueries({ queryKey: ['fastingLogs'] });
      queryClient.invalidateQueries({ queryKey: ['currentFast'] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fastingLogs'] });
      queryClient.invalidateQueries({ queryKey: ['currentFast'] });
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
        queryClient.invalidateQueries({ queryKey: ['currentFast'] });
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

  return {
    startFastMutation,
    endFastMutation,
    addFastMutation,
    updateFastMutation,
    deleteFastMutation,
    isDeleting,
    setIsDeleting
  };
};
