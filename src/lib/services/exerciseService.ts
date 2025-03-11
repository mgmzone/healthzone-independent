
import { supabase } from "@/lib/supabase";
import { ExerciseLog } from "@/lib/types";

export async function getExerciseLogs(limit?: number) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  let query = supabase
    .from('exercise_logs')
    .select('*')
    .eq('user_id', session.user.id)
    .order('date', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching exercise logs:', error);
    return [];
  }

  return data;
}

export async function addExerciseLog(exerciseData: Partial<ExerciseLog>) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('exercise_logs')
    .insert([
      {
        user_id: session.user.id,
        ...exerciseData
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error adding exercise log:', error);
    throw error;
  }

  return data;
}
