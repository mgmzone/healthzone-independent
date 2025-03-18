
import { useState, useEffect } from 'react';
import { getUsersWithStats, getSystemStats, UserStats, SystemStats } from '@/lib/services/adminService';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useAdminData = () => {
  const { 
    data: users, 
    isLoading: isUsersLoading,
    error: usersError 
  } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      try {
        const usersData = await getUsersWithStats();
        console.log('Fetched users data:', usersData);
        return usersData;
      } catch (error) {
        console.error('Error in useAdminData fetching users:', error);
        // Show an error toast
        toast.error('Failed to load user data. Please try again.');
        return []; // Return empty array instead of throwing to prevent errors in UI
      }
    }
  });

  const { 
    data: stats, 
    isLoading: isStatsLoading,
    error: statsError 
  } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      try {
        const statsData = await getSystemStats();
        console.log('Fetched system stats:', statsData);
        return statsData;
      } catch (error) {
        console.error('Error in useAdminData fetching stats:', error);
        // Show an error toast
        toast.error('Failed to load system stats. Please try again.');
        throw error;
      }
    }
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
