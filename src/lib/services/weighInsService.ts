
import { supabase } from "@/lib/supabase";
import { WeighIn } from "@/lib/types";

export async function getWeighIns(limit?: number) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  let query = supabase
    .from('weigh_ins')
    .select('*')
    .eq('user_id', session.user.id)
    .order('date', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching weigh-ins:', error);
    return [];
  }

  // Transform snake_case DB fields to camelCase for our frontend types
  return data.map(item => ({
    id: item.id,
    userId: item.user_id,
    periodId: item.period_id || '',
    date: new Date(item.date),
    weight: item.weight,
    bmi: item.bmi || undefined,
    bodyFatPercentage: item.body_fat_percentage || undefined,
    skeletalMuscleMass: item.skeletal_muscle_mass || undefined,
    boneMass: item.bone_mass || undefined,
    bodyWaterPercentage: item.body_water_percentage || undefined
  }));
}

export async function addWeighIn(weighInData: Partial<WeighIn>) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  // Convert camelCase to snake_case for DB and Date to string
  const dbData = {
    user_id: session.user.id,
    date: weighInData.date ? weighInData.date.toISOString() : new Date().toISOString(),
    weight: weighInData.weight,
    bmi: weighInData.bmi,
    body_fat_percentage: weighInData.bodyFatPercentage,
    skeletal_muscle_mass: weighInData.skeletalMuscleMass,
    bone_mass: weighInData.boneMass,
    body_water_percentage: weighInData.bodyWaterPercentage,
    period_id: weighInData.periodId
  };

  const { data, error } = await supabase
    .from('weigh_ins')
    .insert(dbData)
    .select()
    .single();

  if (error) {
    console.error('Error adding weigh-in:', error);
    throw error;
  }

  // Transform the response to our frontend type
  return {
    id: data.id,
    userId: data.user_id,
    periodId: data.period_id || '',
    date: new Date(data.date),
    weight: data.weight,
    bmi: data.bmi || undefined,
    bodyFatPercentage: data.body_fat_percentage || undefined,
    skeletalMuscleMass: data.skeletal_muscle_mass || undefined,
    boneMass: data.bone_mass || undefined,
    bodyWaterPercentage: data.body_water_percentage || undefined
  };
}
