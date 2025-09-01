
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { FastingLog } from '@/lib/types';
import { 
  getFastingLogs, 
  getCurrentFasting
} from '@/lib/services/fasting';
import { usePeriodQueries } from '@/hooks/periods/usePeriodQueries';

export const useFastingQueries = () => {
  const { user } = useAuth();
  const [activeFast, setActiveFast] = useState<FastingLog | null>(null);
  const { getCurrentPeriod } = usePeriodQueries();
  const currentPeriod = getCurrentPeriod();

  // Query for fasting logs
  const { data: fastingLogs = [], isLoading } = useQuery({
    queryKey: ['fastingLogs'],
    queryFn: () => getFastingLogs(),
    enabled: !!user,
  });

  const filteredFastingLogs = useMemo(() => {
    if (!currentPeriod) return fastingLogs;
    const start = new Date(currentPeriod.startDate);
    const end = currentPeriod.endDate ? new Date(currentPeriod.endDate) : new Date();
    return fastingLogs.filter(log => {
      const startTime = new Date(log.startTime);
      // include if any part of the fast overlaps the period window
      const endTime = log.endTime ? new Date(log.endTime) : startTime;
      return endTime >= start && startTime <= end;
    });
  }, [fastingLogs, currentPeriod]);

  // Query for active fast
  const { data: currentFast, isLoading: isLoadingCurrentFast } = useQuery({
    // Include period start/end in key so switching period refetches the current fast
    queryKey: ['currentFast', currentPeriod?.startDate, currentPeriod?.endDate],
    queryFn: () => getCurrentFasting(),
    enabled: !!user,
  });

  // Update active fast when current fast changes
  useEffect(() => {
    setActiveFast(currentFast || null);
  }, [currentFast]);

  return {
    fastingLogs: filteredFastingLogs,
    isLoading: isLoading || isLoadingCurrentFast,
    activeFast
  };
};
