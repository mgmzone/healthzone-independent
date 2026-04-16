
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
  // Extras from get_admin_user_extras (merged in the hook)
  signup_at?: string | null;
  is_banned?: boolean;
  has_strava_connected?: boolean;
  has_custom_protein_target?: boolean;
  has_ai_context?: boolean;
  has_own_claude_key?: boolean;
  ai_calls_7d?: number;
  ai_cost_7d?: number;
  ai_calls_30d?: number;
  ai_cost_30d?: number;
  ai_fallback_7d?: number;
}

interface AdminUserExtrasRow {
  user_id: string;
  signup_at: string | null;
  is_banned: boolean;
  has_strava_connected: boolean;
  has_custom_protein_target: boolean;
  has_ai_context: boolean;
  has_own_claude_key: boolean;
  ai_calls_7d: number;
  ai_cost_7d: number;
  ai_calls_30d: number;
  ai_cost_30d: number;
  ai_fallback_7d: number;
}

export interface SystemStats {
  totalUsers: number;
  activePeriods: number;
  totalWeighIns: number;
  totalFasts: number;
  totalExercises: number;
  totalMeals: number;
  aiCalls30d: number;
  aiFallbackCost30d: number;
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
        const [usersRes, extrasRes] = await Promise.all([
          supabase.rpc('get_all_users_for_admin'),
          supabase.rpc('get_admin_user_extras'),
        ]);

        if (usersRes.error) throw usersRes.error;

        const base = (usersRes.data || []) as AdminUserStats[];
        const extras = (extrasRes.error ? [] : (extrasRes.data || [])) as AdminUserExtrasRow[];
        const byId = new Map(extras.map((e) => [e.user_id, e]));

        return base.map((u) => {
          const e = byId.get(u.user_id);
          if (!e) return u;
          return {
            ...u,
            signup_at: e.signup_at,
            is_banned: e.is_banned,
            has_strava_connected: e.has_strava_connected,
            has_custom_protein_target: e.has_custom_protein_target,
            has_ai_context: e.has_ai_context,
            has_own_claude_key: e.has_own_claude_key,
            ai_calls_7d: Number(e.ai_calls_7d) || 0,
            ai_cost_7d: Number(e.ai_cost_7d) || 0,
            ai_calls_30d: Number(e.ai_calls_30d) || 0,
            ai_cost_30d: Number(e.ai_cost_30d) || 0,
            ai_fallback_7d: Number(e.ai_fallback_7d) || 0,
          };
        });
      } catch (error) {
        console.error('Error in useAdminData fetching users:', error);
        if (error instanceof Error) {
          console.error('Error details:', error.name, error.message, error.stack);
        }
        toast.error('Failed to load user data. Please try again.');
        return [];
      }
    },
    retry: 1
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
            totalExercises: Number(statsData.total_exercises) || 0,
            totalMeals: Number(statsData.total_meals) || 0,
            aiCalls30d: Number(statsData.ai_calls_30d) || 0,
            aiFallbackCost30d: Number(statsData.ai_fallback_cost_30d) || 0,
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
        
        // Return default values instead of throwing
        return {
          totalUsers: 0,
          activePeriods: 0,
          totalWeighIns: 0,
          totalFasts: 0,
          totalExercises: 0,
          totalMeals: 0,
          aiCalls30d: 0,
          aiFallbackCost30d: 0,
        };
      }
    },
    retry: 1
  });

  return {
    users: users || [],
    stats: stats || {
      totalUsers: 0,
      activePeriods: 0,
      totalWeighIns: 0,
      totalFasts: 0,
      totalExercises: 0,
      totalMeals: 0,
      aiCalls30d: 0,
      aiFallbackCost30d: 0,
    },
    isLoading: isUsersLoading || isStatsLoading,
    error: usersError || statsError
  };
};
