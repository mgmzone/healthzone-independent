
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { FastingLog } from '@/lib/types';
import { 
  getFastingLogs, 
  getCurrentFasting
} from '@/lib/services/fasting';

export const useFastingQueries = () => {
  const { user } = useAuth();
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

  return {
    fastingLogs,
    isLoading: isLoading || isLoadingCurrentFast,
    activeFast
  };
};
