import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SignupDay { day: string; signups: number; }
export interface AiUsageDayRow { day: string; function_name: string; calls: number; cost_usd: number; fallback_calls: number; fallback_cost_usd: number; }
export interface ActivityVolumeDay { day: string; meals: number; weigh_ins: number; exercises: number; fasting: number; }
export interface FeatureAdoption {
  total_users: number;
  profile_complete: number;
  has_active_period: number;
  has_own_claude_key: number;
  has_strava_connected: number;
  has_custom_protein_target: number;
  has_ai_context: number;
  has_macro_data: number;
  wau_this: number;
  wau_prior: number;
}

const n = (v: any) => Number(v) || 0;

export function useAdminAnalytics() {
  const signups = useQuery({
    queryKey: ['adminAnalytics', 'signups'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_signups_by_day', { days_back: 30 });
      if (error) throw error;
      return (data || []).map((r: any): SignupDay => ({ day: r.day, signups: n(r.signups) }));
    },
  });

  const aiUsage = useQuery({
    queryKey: ['adminAnalytics', 'aiUsage'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_ai_usage_by_day', { days_back: 30 });
      if (error) throw error;
      return (data || []).map((r: any): AiUsageDayRow => ({
        day: r.day,
        function_name: r.function_name,
        calls: n(r.calls),
        cost_usd: n(r.cost_usd),
        fallback_calls: n(r.fallback_calls),
        fallback_cost_usd: n(r.fallback_cost_usd),
      }));
    },
  });

  const adoption = useQuery({
    queryKey: ['adminAnalytics', 'adoption'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_feature_adoption');
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) return null;
      return {
        total_users: n(row.total_users),
        profile_complete: n(row.profile_complete),
        has_active_period: n(row.has_active_period),
        has_own_claude_key: n(row.has_own_claude_key),
        has_strava_connected: n(row.has_strava_connected),
        has_custom_protein_target: n(row.has_custom_protein_target),
        has_ai_context: n(row.has_ai_context),
        has_macro_data: n(row.has_macro_data),
        wau_this: n(row.wau_this),
        wau_prior: n(row.wau_prior),
      } as FeatureAdoption;
    },
  });

  const activity = useQuery({
    queryKey: ['adminAnalytics', 'activity'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_activity_volume_by_day', { days_back: 14 });
      if (error) throw error;
      return (data || []).map((r: any): ActivityVolumeDay => ({
        day: r.day,
        meals: n(r.meals),
        weigh_ins: n(r.weigh_ins),
        exercises: n(r.exercises),
        fasting: n(r.fasting),
      }));
    },
  });

  return {
    signups: signups.data || [],
    aiUsage: aiUsage.data || [],
    adoption: adoption.data || null,
    activity: activity.data || [],
    isLoading: signups.isLoading || aiUsage.isLoading || adoption.isLoading || activity.isLoading,
    error: signups.error || aiUsage.error || adoption.error || activity.error,
  };
}
