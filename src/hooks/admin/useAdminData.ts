
import { useState, useEffect } from 'react';
import { getUsersWithStats, getSystemStats, UserStats, SystemStats } from '@/lib/services/adminService';
import { useQuery } from '@tanstack/react-query';

export const useAdminData = () => {
  const { 
    data: users, 
    isLoading: isUsersLoading,
    error: usersError 
  } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: getUsersWithStats
  });

  const { 
    data: stats, 
    isLoading: isStatsLoading,
    error: statsError 
  } = useQuery({
    queryKey: ['adminStats'],
    queryFn: getSystemStats
  });

  return {
    users: users || [],
    stats: stats || {
      totalUsers: 0,
      activePeriods: 0,
      totalWeighIns: 0,
      totalFasts: 0,
      totalExercises: 0
    },
    isLoading: isUsersLoading || isStatsLoading,
    error: usersError || statsError
  };
};
