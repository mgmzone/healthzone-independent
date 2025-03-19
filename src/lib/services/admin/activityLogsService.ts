
import { supabase } from "@/integrations/supabase/client";
import { ActivityLogItem } from "./types";

export async function getActivityLogs(userId?: string): Promise<ActivityLogItem[]> {
  try {
    // If no userId provided or called from admin page, get all activity logs
    // This is a simplified implementation - in a real app, 
    // you would check admin permissions first
    const isAdmin = !userId;
    
    let logs: ActivityLogItem[] = [];
    
    // Fetch weigh-ins 
    const { data: weighIns, error: weighInsError } = await supabase
      .from('weigh_ins')
      .select('date, user_id')
      .eq(userId ? 'user_id' : 'user_id', userId || 'user_id')
      .order('date', { ascending: false });
      
    if (weighInsError) {
      console.error('Error fetching weigh-ins:', weighInsError);
    } else if (weighIns) {
      logs = logs.concat(weighIns.map(wi => ({ 
        date: wi.date,
        type: 'weighIn' as const
      })));
    }
    
    // Fetch fasting logs 
    const { data: fastingLogs, error: fastingError } = await supabase
      .from('fasting_logs')
      .select('end_time, user_id')
      .eq(userId ? 'user_id' : 'user_id', userId || 'user_id')
      .order('end_time', { ascending: false });
      
    if (fastingError) {
      console.error('Error fetching fasting logs:', fastingError);
    } else if (fastingLogs) {
      logs = logs.concat(fastingLogs.map(fl => ({ 
        date: fl.end_time,
        type: 'fast' as const
      })));
    }
    
    // Fetch exercise logs 
    const { data: exerciseLogs, error: exerciseError } = await supabase
      .from('exercise_logs')
      .select('date, user_id')
      .eq(userId ? 'user_id' : 'user_id', userId || 'user_id')
      .order('date', { ascending: false });
      
    if (exerciseError) {
      console.error('Error fetching exercise logs:', exerciseError);
    } else if (exerciseLogs) {
      logs = logs.concat(exerciseLogs.map(el => ({ 
        date: el.date,
        type: 'exercise' as const
      })));
    }
    
    return logs;
  } catch (error) {
    console.error('Error in getActivityLogs:', error);
    return [];
  }
}
