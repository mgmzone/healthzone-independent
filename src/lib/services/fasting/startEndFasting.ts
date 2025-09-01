
import { supabase } from "@/lib/supabase";
import { transformFastingLogResponse } from './utils';
import { calculateEatingWindowHours } from '@/components/fasting/utils/fastingUtils';
import { getCurrentPeriodRange } from '@/lib/services/periodsService';

export async function startFasting(fastingHours: number = 16, eatingWindowHours: number = 8) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  // Require an active period to add data
  const period = await getCurrentPeriodRange();
  if (!period) throw new Error('No active period. Create a period before starting a fast.');

  const now = new Date();
  
  const { data, error } = await supabase
    .from('fasting_logs')
    .insert({
      user_id: session.user.id,
      start_time: now.toISOString(),
      fasting_hours: fastingHours,
      eating_window_hours: eatingWindowHours
    })
    .select()
    .single();

  if (error) {
    console.error('Error starting fasting:', error);
    throw error;
  }

  return transformFastingLogResponse(data);
}

export async function endFasting(fastingId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const now = new Date();
  
  const { data: fastingData } = await supabase
    .from('fasting_logs')
    .select('start_time, fasting_hours')
    .eq('id', fastingId)
    .single();

  if (!fastingData) throw new Error('Fasting log not found');

  const startTime = new Date(fastingData.start_time);
  const durationInHours = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  
  // Use the utility function to calculate eating window hours
  const eatingWindowHours = calculateEatingWindowHours(durationInHours);

  const { data, error } = await supabase
    .from('fasting_logs')
    .update({
      end_time: now.toISOString(),
      fasting_hours: parseFloat(durationInHours.toFixed(2)),
      eating_window_hours: eatingWindowHours
    })
    .eq('id', fastingId)
    .eq('user_id', session.user.id)
    .select()
    .single();

  if (error) {
    console.error('Error ending fasting:', error);
    throw error;
  }

  return transformFastingLogResponse(data);
}
