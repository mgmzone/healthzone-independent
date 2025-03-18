import { supabase } from "@/integrations/supabase/client";
import { ActivityLogItem } from "@/components/admin/charts/chartDataGenerator";
import { User } from "@/lib/types";

export interface UserStats {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  lastLogin: string | null;
  isProfileComplete: boolean;
  hasActivePeriod: boolean;
  weighInsCount: number;
  fastsCount: number;
  exercisesCount: number;
}

export interface SystemStats {
  totalUsers: number;
  activePeriods: number;
  totalWeighIns: number;
  totalFasts: number;
  totalExercises: number;
}

export async function getUsersWithStats(): Promise<UserStats[]> {
  try {
    console.log('Fetching users for admin dashboard...');
    
    // Get all users using our security definer function
    const { data: users, error: usersError } = await supabase
      .rpc('get_all_users_for_admin');

    if (usersError) {
      console.error('Error fetching users:', usersError);
      console.log('SQL error details:', usersError.message, usersError.details);
      throw usersError;
    }

    if (!users || users.length === 0) {
      console.log('No users returned from get_all_users_for_admin');
      return [];
    }

    console.log('Users data retrieved successfully:', users);

    // Transform the data to match our UserStats interface
    const usersWithStats: UserStats[] = users.map(user => {
      return {
        // Use user_id instead of id
        id: user.user_id,
        email: user.email || 'Unknown',
        // Use firstname/lastname instead of first_name/last_name
        firstName: user.firstname || '',
        lastName: user.lastname || '',
        lastLogin: user.last_sign_in_at || null,
        isProfileComplete: user.profile_complete,
        hasActivePeriod: user.in_active_period,
        weighInsCount: Number(user.total_weigh_ins) || 0,
        fastsCount: Number(user.total_fasting_days) || 0,
        exercisesCount: Number(user.total_activities) || 0
      };
    });

    console.log(`Successfully processed ${usersWithStats.length} users with stats`);
    return usersWithStats;
  } catch (error) {
    console.error('Error in getUsersWithStats:', error);
    throw error;
  }
}

export async function getSystemStats(): Promise<SystemStats> {
  try {
    // Get system stats using our security definer function
    const { data: stats, error } = await supabase
      .rpc('get_system_stats_for_admin');

    if (error) {
      console.error('Error fetching system stats:', error);
      throw error;
    }

    if (!stats || stats.length === 0) {
      console.log('No stats returned from get_system_stats_for_admin');
      return {
        totalUsers: 0,
        activePeriods: 0,
        totalWeighIns: 0,
        totalFasts: 0,
        totalExercises: 0
      };
    }

    console.log('System stats:', stats);
    
    const systemStats = stats[0];

    return {
      totalUsers: Number(systemStats.total_users) || 0,
      activePeriods: Number(systemStats.active_periods) || 0,
      totalWeighIns: Number(systemStats.total_weigh_ins) || 0,
      totalFasts: Number(systemStats.total_fasts) || 0,
      totalExercises: Number(systemStats.total_exercises) || 0
    };
  } catch (error) {
    console.error('Error in getSystemStats:', error);
    return {
      totalUsers: 0,
      activePeriods: 0,
      totalWeighIns: 0,
      totalFasts: 0,
      totalExercises: 0
    };
  }
}

export async function getActivityLogs(): Promise<ActivityLogItem[]> {
  try {
    // Fetch user weigh-ins
    const { data: weighIns, error: weighInsError } = await supabase
      .from('weigh_ins')
      .select('date')
      .order('date', { ascending: true });

    if (weighInsError) {
      console.error('Error fetching weigh-ins logs:', weighInsError);
    }

    // Fetch fasting logs
    const { data: fastingLogs, error: fastingLogsError } = await supabase
      .from('fasting_logs')
      .select('start_time')
      .order('start_time', { ascending: true });

    if (fastingLogsError) {
      console.error('Error fetching fasting logs:', fastingLogsError);
    }

    // Fetch exercise logs
    const { data: exerciseLogs, error: exerciseLogsError } = await supabase
      .from('exercise_logs')
      .select('date')
      .order('date', { ascending: true });

    if (exerciseLogsError) {
      console.error('Error fetching exercise logs:', exerciseLogsError);
    }

    console.log('Activity logs data:', { weighIns, fastingLogs, exerciseLogs });

    // Transform data to ActivityLogItem format
    const activityLogs: ActivityLogItem[] = [
      ...(weighIns || []).map(item => ({ 
        date: item.date, 
        type: 'weighIn' as const 
      })),
      ...(fastingLogs || []).map(item => ({ 
        date: item.start_time, 
        type: 'fast' as const 
      })),
      ...(exerciseLogs || []).map(item => ({ 
        date: item.date, 
        type: 'exercise' as const 
      }))
    ];

    return activityLogs;
  } catch (error) {
    console.error('Error in getActivityLogs:', error);
    return [];
  }
}
