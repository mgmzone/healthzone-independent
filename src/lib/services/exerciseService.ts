import { supabase } from "@/lib/supabase";
import { ExerciseLog } from "@/lib/types";
import { getCurrentPeriodRange } from '@/lib/services/periodsService';

export async function getExerciseLogs(limit?: number) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const period = await getCurrentPeriodRange();

  let query = supabase
    .from('exercise_logs')
    .select('*')
    .eq('user_id', session.user.id)
    .order('date', { ascending: false });

  if (period?.start) {
    query = query.gte('date', period.start);
  }
  if (period?.end) {
    query = query.lte('date', period.end);
  }

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching exercise logs:', error);
    return [];
  }

  // Transform snake_case DB fields to camelCase for our frontend types
  return data.map(item => ({
    id: item.id,
    userId: item.user_id,
    date: new Date(item.date),
    type: item.type as 'walk' | 'run' | 'bike' | 'elliptical' | 'other',
    minutes: item.minutes,
    intensity: item.intensity as 'low' | 'medium' | 'high',
    steps: item.steps || undefined,
    distance: item.distance || undefined,
    lowestHeartRate: item.lowest_heart_rate || undefined,
    highestHeartRate: item.highest_heart_rate || undefined,
    averageHeartRate: item.average_heart_rate || undefined
  }));
}

export async function addExerciseLog(exerciseData: Partial<ExerciseLog>) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  // Require an active period to add data
  const period = await getCurrentPeriodRange();
  if (!period) throw new Error('No active period. Create a period before adding data.');

  // Convert camelCase to snake_case for DB and Date to string
  const dbData = {
    user_id: session.user.id,
    date: exerciseData.date ? exerciseData.date.toISOString() : new Date().toISOString(),
    type: exerciseData.type || 'walk',
    minutes: exerciseData.minutes || 0,
    intensity: exerciseData.intensity || 'medium',
    steps: exerciseData.steps,
    distance: exerciseData.distance,
    lowest_heart_rate: exerciseData.lowestHeartRate,
    highest_heart_rate: exerciseData.highestHeartRate,
    average_heart_rate: exerciseData.averageHeartRate
  };

  const { data, error } = await supabase
    .from('exercise_logs')
    .insert(dbData)
    .select()
    .single();

  if (error) {
    console.error('Error adding exercise log:', error);
    throw error;
  }

  // Transform the response to our frontend type
  return {
    id: data.id,
    userId: data.user_id,
    date: new Date(data.date),
    type: data.type as 'walk' | 'run' | 'bike' | 'elliptical' | 'other',
    minutes: data.minutes,
    intensity: data.intensity as 'low' | 'medium' | 'high',
    steps: data.steps || undefined,
    distance: data.distance || undefined,
    lowestHeartRate: data.lowest_heart_rate || undefined,
    highestHeartRate: data.highest_heart_rate || undefined,
    averageHeartRate: data.average_heart_rate || undefined
  };
}

export async function updateExerciseLog(id: string, exerciseData: Partial<ExerciseLog>) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  // Convert camelCase to snake_case for DB
  const dbData: Record<string, any> = {};
  
  if (exerciseData.date) {
    dbData.date = exerciseData.date.toISOString();
  }
  
  if (exerciseData.type) {
    dbData.type = exerciseData.type;
  }
  
  if (exerciseData.minutes !== undefined) {
    dbData.minutes = exerciseData.minutes;
  }
  
  if (exerciseData.intensity) {
    dbData.intensity = exerciseData.intensity;
  }
  
  if (exerciseData.steps !== undefined) {
    dbData.steps = exerciseData.steps;
  }
  
  if (exerciseData.distance !== undefined) {
    dbData.distance = exerciseData.distance;
  }
  
  if (exerciseData.lowestHeartRate !== undefined) {
    dbData.lowest_heart_rate = exerciseData.lowestHeartRate;
  }
  
  if (exerciseData.highestHeartRate !== undefined) {
    dbData.highest_heart_rate = exerciseData.highestHeartRate;
  }
  
  if (exerciseData.averageHeartRate !== undefined) {
    dbData.average_heart_rate = exerciseData.averageHeartRate;
  }

  const { data, error } = await supabase
    .from('exercise_logs')
    .update(dbData)
    .eq('id', id)
    .eq('user_id', session.user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating exercise log:', error);
    throw error;
  }

  // Transform the response to our frontend type
  return {
    id: data.id,
    userId: data.user_id,
    date: new Date(data.date),
    type: data.type as 'walk' | 'run' | 'bike' | 'elliptical' | 'other',
    minutes: data.minutes,
    intensity: data.intensity as 'low' | 'medium' | 'high',
    steps: data.steps || undefined,
    distance: data.distance || undefined,
    lowestHeartRate: data.lowest_heart_rate || undefined,
    highestHeartRate: data.highest_heart_rate || undefined,
    averageHeartRate: data.average_heart_rate || undefined
  };
}

export async function deleteExerciseLog(id: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('exercise_logs')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id);

  if (error) {
    console.error('Error deleting exercise log:', error);
    throw error;
  }

  return true;
}

// For future Strava API integration
export async function fetchStravaActivities() {
  // This will be implemented when we add the Strava API edge function
  return [];
}
