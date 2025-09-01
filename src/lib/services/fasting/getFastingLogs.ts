
import { supabase } from "@/lib/supabase";
import { FastingLog } from "@/lib/types";
import { transformFastingLogResponse } from './utils';
import { getCurrentPeriodRange } from '@/lib/services/periodsService';

export async function getFastingLogs(limit?: number) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const period = await getCurrentPeriodRange();

  let query = supabase
    .from('fasting_logs')
    .select('*')
    .eq('user_id', session.user.id)
    .order('start_time', { ascending: false });

  // If a current period exists, filter for fasts that overlap the period window
  if (period?.start) {
    if (period.end) {
      // Overlap condition: start_time <= end AND (end_time IS NULL OR end_time >= start)
      query = query.lte('start_time', period.end)
        .or('end_time.is.null,end_time.gte.' + period.start);
    } else {
      // Open-ended period from start -> now: include fasts that end after start
      query = query.or('end_time.is.null,end_time.gte.' + period.start);
    }
  }

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
