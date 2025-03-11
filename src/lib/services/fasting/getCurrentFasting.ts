
import { supabase } from "@/lib/supabase";
import { transformFastingLogResponse } from './utils';

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

  return transformFastingLogResponse(data);
}
