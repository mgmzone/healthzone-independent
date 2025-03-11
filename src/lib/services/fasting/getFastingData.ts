
import { supabase } from "@/lib/supabase";
import { FastingLog } from "@/lib/types";

export async function getFastingLogs(limit?: number) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  let query = supabase
    .from('fasting_logs')
    .select('*')
    .eq('user_id', session.user.id)
    .order('start_time', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching fasting logs:', error);
    return [];
  }

  // Transform snake_case DB fields to camelCase for our frontend types
  return data.map(item => ({
    id: item.id,
    userId: item.user_id,
    startTime: new Date(item.start_time),
    endTime: item.end_time ? new Date(item.end_time) : undefined,
    fastingHours: item.fasting_hours || undefined,
    eatingWindowHours: item.eating_window_hours || undefined
  }));
}

export async function getCurrentFasting() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('fasting_logs')
    .select('*')
    .eq('user_id', session.user.id)
    .is('end_time', null)
    .order('start_time', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching current fasting:', error);
    return null;
  }

  if (!data) return null;

  // Transform snake_case DB fields to camelCase for our frontend types
  return {
    id: data.id,
    userId: data.user_id,
    startTime: new Date(data.start_time),
    endTime: data.end_time ? new Date(data.end_time) : undefined,
    fastingHours: data.fasting_hours || undefined,
    eatingWindowHours: data.eating_window_hours || undefined
  };
}
