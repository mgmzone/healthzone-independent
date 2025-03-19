
import { supabase } from "@/integrations/supabase/client";
import { ActivityLogItem } from './types';

export async function getActivityLogs(): Promise<ActivityLogItem[]> {
  try {
    console.log('Fetching activity logs for admin dashboard...');
    
    // Fetch weigh-in logs
    const { data: weighInLogs, error: weighInError } = await supabase
      .from('weigh_ins')
      .select('date, user_id')
      .order('date', { ascending: false });
    
    if (weighInError) {
      console.error('Error fetching weigh-in logs:', weighInError);
      throw weighInError;
    }

    // Fetch fasting logs
    const { data: fastingLogs, error: fastingError } = await supabase
      .from('fasting_logs')
      .select('start_time')
      .order('start_time', { ascending: false });
    
    if (fastingError) {
      console.error('Error fetching fasting logs:', fastingError);
      throw fastingError;
    }

    // Fetch exercise logs
    const { data: exerciseLogs, error: exerciseError } = await supabase
      .from('exercise_logs')
      .select('date')
      .order('date', { ascending: false });
    
    if (exerciseError) {
      console.error('Error fetching exercise logs:', exerciseError);
      throw exerciseError;
    }

    // Convert DB data to ActivityLogItem format
    const activities: ActivityLogItem[] = [
      // Weigh-in logs
      ...(weighInLogs?.map(log => ({
        date: log.date,
        type: 'weighIn' as const
      })) || []),
      
      // Fasting logs
      ...(fastingLogs?.map(log => ({
        date: log.start_time,
        type: 'fast' as const
      })) || []),
      
      // Exercise logs
      ...(exerciseLogs?.map(log => ({
        date: log.date,
        type: 'exercise' as const
      })) || [])
    ];

    console.log(`Successfully retrieved ${activities.length} activity logs`);
    return activities;
  } catch (error) {
    console.error('Error in getActivityLogs:', error);
    return [];
  }
}
