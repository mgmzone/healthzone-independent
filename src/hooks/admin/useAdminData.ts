
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
        console.log('Starting to fetch admin user data...');
        const usersData = await getUsersWithStats();
        console.log('Fetched users data successfully:', usersData);
        return usersData;
      } catch (error) {
        console.error('Error in useAdminData fetching users:', error);
        // Log the detailed error information
        if (error instanceof Error) {
          console.error('Error details:', error.name, error.message, error.stack);
        }
        
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
        console.log('Starting to fetch admin stats data...');
        const statsData = await getSystemStats();
        console.log('Fetched system stats successfully:', statsData);
        return statsData;
      } catch (error) {
        console.error('Error in useAdminData fetching stats:', error);
        // Log the detailed error information
        if (error instanceof Error) {
          console.error('Error details:', error.name, error.message, error.stack);
        }
        
        // Show an error toast
        toast.error('Failed to load system stats. Please try again.');
        throw error;
      }
    }
  });

  useEffect(() => {
    if (usersError) {
      console.error('Users query error in useAdminData:', usersError);
    }
    if (statsError) {
      console.error('Stats query error in useAdminData:', statsError);
    }
  }, [usersError, statsError]);

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
