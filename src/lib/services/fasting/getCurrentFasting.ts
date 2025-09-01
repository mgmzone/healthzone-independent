
import { supabase } from "@/lib/supabase";
import { transformFastingLogResponse } from './utils';
import { getCurrentPeriodRange } from '@/lib/services/periodsService';

export async function getCurrentFasting() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  // Constrain to fasts that START within the active period window
  // If no active period, treat as no current fast for the UI requirement
  const period = await getCurrentPeriodRange();
  if (!period?.start) return null;

  let query = supabase
    .from('fasting_logs')
    .select('*')
    .eq('user_id', session.user.id)
    .is('end_time', null)
    .gte('start_time', period.start);

  if (period.end) {
    query = query.lte('start_time', period.end);
  }

  const { data, error } = await query
    .order('start_time', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching current fasting:', error);
    return null;
  }

  if (!data) return null;

  return transformFastingLogResponse(data);
}
