
import { supabase } from '@/lib/supabase';
import { updateProfileCurrentWeight } from '@/lib/services/profileService';
import { prepareWeighInData } from '../utils/prepareWeighInData';

/**
 * Adds a new weigh-in record to the database
 */
export async function addWeighInRecord(
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
  // Prepare data for insertion
  const weighInData = await prepareWeighInData(
    supabase,
    weight, 
    date, 
    periodId,
    additionalMetrics
  );
  
  // Insert into database
  const { data, error } = await supabase
    .from('weigh_ins')
    .insert(weighInData)
    .select()
    .single();

  if (error) {
    console.error("Error inserting weigh-in:", error);
    throw error;
  }
  
  console.log("Weigh-in added successfully:", data);
  
  // Update profile with the new weight
  try {
    await updateProfileCurrentWeight(weight);
  } catch (profileError) {
    console.error('Error updating profile with new weight:', profileError);
  }
  
  return data;
}
