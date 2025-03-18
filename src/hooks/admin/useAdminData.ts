
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AdminUserStats {
  lastname: string;
  firstname: string;
  user_id: string;
  profile_complete: boolean;
  in_active_period: boolean;
  week_weigh_ins: number;
  total_weigh_ins: number;
  week_activities: number;
  total_activities: number;
  week_fasting_days: number;
  total_fasting_days: number;
  email: string;
  last_sign_in_at: string | null;
}

export interface SystemStats {
  totalUsers: number;
  activePeriods: number;
  totalWeighIns: number;
  totalFasts: number;
  totalExercises: number;
}

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
        
        const { data, error } = await supabase
          .rpc('get_all_users_for_admin');
        
        if (error) {
          console.error('Error fetching admin users:', error);
          throw error;
        }
        
        console.log('Fetched admin users data successfully:', data);
        return data as AdminUserStats[];
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
        const { data, error } = await supabase
          .rpc('get_system_stats_for_admin');
        
        if (error) {
          console.error('Error fetching system stats:', error);
          throw error;
        }
        
        console.log('Fetched system stats successfully:', data);
        
        if (data && data.length > 0) {
          const statsData = data[0];
          return {
            totalUsers: Number(statsData.total_users) || 0,
            activePeriods: Number(statsData.active_periods) || 0,
            totalWeighIns: Number(statsData.total_weigh_ins) || 0,
            totalFasts: Number(statsData.total_fasts) || 0,
            totalExercises: Number(statsData.total_exercises) || 0
          };
        }
        
        throw new Error('No stats data returned');
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
