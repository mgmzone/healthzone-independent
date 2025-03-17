
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
    // Get all users using our security definer function
    const { data: users, error: usersError } = await supabase
      .rpc('get_all_users_for_admin');

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return [];
    }

    if (!users || users.length === 0) {
      return [];
    }

    // Get user stats for each user
    const usersWithStats = await Promise.all(users.map(async (user) => {
      // Get stats for this user
      const { data: stats, error: statsError } = await supabase
        .rpc('get_user_stats_for_admin', { p_user_id: user.id });

      if (statsError) {
        console.error(`Error fetching stats for user ${user.id}:`, statsError);
        return null;
      }

      const userStats = stats && stats.length > 0 ? stats[0] : {
        weigh_ins_count: 0,
        fasts_count: 0,
        exercises_count: 0,
        has_active_period: false
      };

      // Check if profile is complete
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, current_weight, target_weight, height, birth_date')
        .eq('id', user.id)
        .single();

      const isProfileComplete = !!(
        profile?.first_name && 
        profile?.current_weight && 
        profile?.target_weight && 
        profile?.height &&
        profile?.birth_date
      );

      return {
        id: user.id,
        email: user.email || 'Unknown',
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        lastLogin: user.last_sign_in_at || null,
        isProfileComplete,
        hasActivePeriod: userStats.has_active_period,
        weighInsCount: Number(userStats.weigh_ins_count) || 0,
        fastsCount: Number(userStats.fasts_count) || 0,
        exercisesCount: Number(userStats.exercises_count) || 0
      };
    }));

    // Filter out null values and return
    return usersWithStats.filter(user => user !== null) as UserStats[];
  } catch (error) {
    console.error('Error in getUsersWithStats:', error);
    return [];
  }
}

export async function getSystemStats(): Promise<SystemStats> {
  try {
    // Get system stats using our security definer function
    const { data: stats, error } = await supabase
      .rpc('get_system_stats_for_admin');

    if (error) {
      console.error('Error fetching system stats:', error);
      return {
        totalUsers: 0,
        activePeriods: 0,
        totalWeighIns: 0,
        totalFasts: 0,
        totalExercises: 0
      };
    }

    const systemStats = stats && stats.length > 0 ? stats[0] : {
      total_users: 0,
      active_periods: 0,
      total_weigh_ins: 0,
      total_fasts: 0,
      total_exercises: 0
    };

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

// New function to fetch activity logs for charts
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
