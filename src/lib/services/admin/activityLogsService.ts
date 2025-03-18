
import { supabase } from "@/integrations/supabase/client";
import { ActivityLogItem } from "./types";

export async function getActivityLogs(): Promise<ActivityLogItem[]> {
  try {
    // Fetch user weigh-ins
    const { data: weighIns, error: weighInsError } = await supabase
      .from('weigh_ins')
      .select('date')
      .order('date', { ascending: true });

    if (weighInsError) {
      console.error('Error fetching weigh-ins logs:', weighInsError);
    }

    // Fetch fasting logs
    const { data: fastingLogs, error: fastingLogsError } = await supabase
      .from('fasting_logs')
      .select('start_time')
      .order('start_time', { ascending: true });

    if (fastingLogsError) {
      console.error('Error fetching fasting logs:', fastingLogsError);
    }

    // Fetch exercise logs
    const { data: exerciseLogs, error: exerciseLogsError } = await supabase
      .from('exercise_logs')
      .select('date')
      .order('date', { ascending: true });

    if (exerciseLogsError) {
      console.error('Error fetching exercise logs:', exerciseLogsError);
    }

    console.log('Activity logs data:', { weighIns, fastingLogs, exerciseLogs });

    // Transform data to ActivityLogItem format
    const activityLogs: ActivityLogItem[] = [
      ...(weighIns || []).map(item => ({ 
        date: item.date, 
        type: 'weighIn' as const 
      })),
      ...(fastingLogs || []).map(item => ({ 
        date: item.start_time, 
        type: 'fast' as const 
      })),
      ...(exerciseLogs || []).map(item => ({ 
        date: item.date, 
        type: 'exercise' as const 
      }))
    ];

    return activityLogs;
  } catch (error) {
    console.error('Error in getActivityLogs:', error);
    return [];
  }
}
