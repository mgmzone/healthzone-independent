
import { supabase } from "@/integrations/supabase/client";
import { SystemStats } from "./types";

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
