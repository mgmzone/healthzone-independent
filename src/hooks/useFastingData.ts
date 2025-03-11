
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { FastingLog } from '@/lib/types';
import { mockFastingLogs } from '@/lib/types';
import { addHours } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

export const useFastingData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [fastingLogs, setFastingLogs] = useState<FastingLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFast, setActiveFast] = useState<FastingLog | null>(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // In a real app, fetch from API or database
        // For now, use mock data
        const logs = [...mockFastingLogs];
        setFastingLogs(logs);
        
        // Check if there's an active fast (no end time)
        const active = logs.find(log => !log.endTime);
        setActiveFast(active || null);
      } catch (error) {
        console.error('Error fetching fasting data:', error);
        toast({
          title: 'Error loading fasting data',
          description: 'Please try again later',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, toast]);

  // Start a new fast
  const startFast = useCallback(() => {
    if (activeFast) {
      toast({
        title: 'Fast already in progress',
        description: 'End your current fast before starting a new one',
        variant: 'destructive',
      });
      return;
    }

    const now = new Date();
    const newFast: FastingLog = {
      id: uuidv4(),
      userId: user?.id || '1',
      startTime: now,
      fastingHours: 16,
      eatingWindowHours: 8,
    };

    setFastingLogs(prev => [newFast, ...prev]);
    setActiveFast(newFast);

    toast({
      title: 'Fast started',
      description: `Your fast has started at ${now.toLocaleTimeString()}`,
    });
  }, [activeFast, user, toast]);

  // End the current fast
  const endFast = useCallback(() => {
    if (!activeFast) {
      toast({
        title: 'No active fast',
        description: 'You need to start a fast first',
        variant: 'destructive',
      });
      return;
    }

    const now = new Date();
    const updatedFast = { ...activeFast, endTime: now };

    setFastingLogs(prev => 
      prev.map(fast => fast.id === activeFast.id ? updatedFast : fast)
    );
    setActiveFast(null);

    toast({
      title: 'Fast completed',
      description: `Your fast has ended at ${now.toLocaleTimeString()}`,
    });
  }, [activeFast, toast]);

  // Add a past fast
  const addFast = useCallback((fastData: {
    startTime: Date;
    endTime?: Date;
    fastingHours?: number;
    eatingWindowHours?: number;
  }) => {
    const newFast: FastingLog = {
      id: uuidv4(),
      userId: user?.id || '1',
      startTime: fastData.startTime,
      endTime: fastData.endTime,
      fastingHours: fastData.fastingHours,
      eatingWindowHours: fastData.eatingWindowHours,
    };

    setFastingLogs(prev => [newFast, ...prev]);

    toast({
      title: 'Fast added',
      description: 'Your fast has been added successfully',
    });
  }, [user, toast]);

  // Update a fast
  const updateFast = useCallback((
    id: string,
    updatedFast: {
      startTime: Date;
      endTime?: Date;
      fastingHours?: number;
      eatingWindowHours?: number;
    }
  ) => {
    setFastingLogs(prev => 
      prev.map(fast => {
        if (fast.id === id) {
          return {
            ...fast,
            ...updatedFast,
          };
        }
        return fast;
      })
    );

    // If the updated fast is the active one, update the active fast state
    if (activeFast && activeFast.id === id) {
      setActiveFast(prev => {
        if (!prev) return null;
        return {
          ...prev,
          ...updatedFast,
        };
      });
    }

    toast({
      title: 'Fast updated',
      description: 'The fast has been updated successfully',
    });
  }, [activeFast, toast]);

  // Delete a fast
  const deleteFast = useCallback((id: string) => {
    // Check if it's the active fast
    if (activeFast && activeFast.id === id) {
      setActiveFast(null);
    }

    setFastingLogs(prev => prev.filter(fast => fast.id !== id));

    toast({
      title: 'Fast deleted',
      description: 'The fast has been deleted successfully',
    });
  }, [activeFast, toast]);

  return {
    fastingLogs,
    isLoading,
    activeFast,
    startFast,
    endFast,
    addFast,
    updateFast,
    deleteFast,
  };
};
