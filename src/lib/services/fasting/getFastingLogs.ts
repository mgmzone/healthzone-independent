
import { supabase } from "@/lib/supabase";
import { FastingLog } from "@/lib/types";
import { transformFastingLogResponse } from './utils';

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

  // Transform data using the utility function
  return data.map(item => transformFastingLogResponse(item));
}
