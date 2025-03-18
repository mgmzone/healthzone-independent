
import { supabase } from "@/integrations/supabase/client";
import { UserStats } from "./types";

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
