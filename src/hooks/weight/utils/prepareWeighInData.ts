
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Prepares weigh-in data for database insertion
 */
export async function prepareWeighInData(
  supabase: SupabaseClient,
  weight: number, 
  date: Date, 
  periodId: string | null,
  additionalMetrics?: {
    bmi?: number;
    bodyFatPercentage?: number;
    skeletalMuscleMass?: number;
    boneMass?: number;
    bodyWaterPercentage?: number;
  }
) {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  
  if (!userId) {
    throw new Error("User not authenticated");
  }
  
  return {
    weight,
    date: date.toISOString(),
    user_id: userId,
    period_id: periodId,
    bmi: additionalMetrics?.bmi || null,
    body_fat_percentage: additionalMetrics?.bodyFatPercentage || null,
    skeletal_muscle_mass: additionalMetrics?.skeletalMuscleMass || null,
    bone_mass: additionalMetrics?.boneMass || null,
    body_water_percentage: additionalMetrics?.bodyWaterPercentage || null
  };
}
