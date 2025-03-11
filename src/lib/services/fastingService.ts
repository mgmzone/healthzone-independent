
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

  return data;
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

  return data;
}

export async function startFasting() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('fasting_logs')
    .insert([
      {
        user_id: session.user.id,
        start_time: new Date()
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error starting fasting:', error);
    throw error;
  }

  return data;
}

export async function endFasting(fastingId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const endTime = new Date();
  const { data: fastingData } = await supabase
    .from('fasting_logs')
    .select('start_time')
    .eq('id', fastingId)
    .single();

  if (!fastingData) throw new Error('Fasting log not found');

  const startTime = new Date(fastingData.start_time);
  const fastingHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  const eatingWindowHours = 24 - fastingHours;

  const { data, error } = await supabase
    .from('fasting_logs')
    .update({
      end_time: endTime,
      fasting_hours: parseFloat(fastingHours.toFixed(2)),
      eating_window_hours: parseFloat(eatingWindowHours.toFixed(2))
    })
    .eq('id', fastingId)
    .eq('user_id', session.user.id)
    .select()
    .single();

  if (error) {
    console.error('Error ending fasting:', error);
    throw error;
  }

  return data;
}
