
import { supabase } from "@/integrations/supabase/client";
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
    // Get all users from profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return [];
    }

    // Get auth data for last login times
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching auth data:', authError);
      return [];
    }

    // Get counts of user data
    const usersWithStats = await Promise.all(profiles.map(async (profile) => {
      // Get weigh-ins count
      const { count: weighInsCount, error: weighInError } = await supabase
        .from('weigh_ins')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id);

      // Get fasting logs count
      const { count: fastsCount, error: fastsError } = await supabase
        .from('fasting_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id);

      // Get exercise logs count
      const { count: exercisesCount, error: exercisesError } = await supabase
        .from('exercise_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id);

      // Check if user has active period
      const { data: activePeriod, error: periodError } = await supabase
        .rpc('get_current_active_period', { p_user_id: profile.id });

      // Find auth data for this user
      const userData = authData?.users ? authData.users.find(user => user.id === profile.id) : null;
      
      // Check if profile is complete
      const isProfileComplete = !!(
        profile.first_name && 
        profile.current_weight && 
        profile.target_weight && 
        profile.height &&
        profile.birth_date
      );

      return {
        id: profile.id,
        email: userData?.email || 'Unknown',
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        lastLogin: userData?.last_sign_in_at || null,
        isProfileComplete,
        hasActivePeriod: activePeriod && activePeriod.length > 0,
        weighInsCount: weighInsCount || 0,
        fastsCount: fastsCount || 0,
        exercisesCount: exercisesCount || 0
      };
    }));

    return usersWithStats;
  } catch (error) {
    console.error('Error in getUsersWithStats:', error);
    return [];
  }
}

export async function getSystemStats(): Promise<SystemStats> {
  try {
    // Get total users count
    const { count: totalUsers, error: usersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get active periods count
    const { count: activePeriods, error: periodsError } = await supabase
      .from('periods')
      .select('*', { count: 'exact', head: true })
      .is('end_date', null);

    // Get weigh-ins count
    const { count: totalWeighIns, error: weighInsError } = await supabase
      .from('weigh_ins')
      .select('*', { count: 'exact', head: true });

    // Get fasting logs count
    const { count: totalFasts, error: fastsError } = await supabase
      .from('fasting_logs')
      .select('*', { count: 'exact', head: true });

    // Get exercise logs count
    const { count: totalExercises, error: exercisesError } = await supabase
      .from('exercise_logs')
      .select('*', { count: 'exact', head: true });

    return {
      totalUsers: totalUsers || 0,
      activePeriods: activePeriods || 0,
      totalWeighIns: totalWeighIns || 0,
      totalFasts: totalFasts || 0,
      totalExercises: totalExercises || 0
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
