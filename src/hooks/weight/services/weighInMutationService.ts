
import { SupabaseClient } from '@supabase/supabase-js';
import { Period } from '@/lib/types';
import { updateProfile } from '@/lib/services/profileService';
import { prepareWeighInData } from '../utils/prepareWeighInData';
import { 
  calculateProjectedEndDateFromWeights, 
  updateProjectedEndDate 
} from './projectedEndDateService';
import { usePeriodCalculations } from '@/hooks/periods/usePeriodCalculations';

/**
 * Handles the logic for adding a new weigh-in and updating related data
 */
export async function performWeighInMutation(
  supabase: SupabaseClient,
  weight: number,
  date: Date,
  currentPeriod: Period | undefined,
  calculateProjectedEndDate: ReturnType<typeof usePeriodCalculations>['calculateProjectedEndDate'],
  additionalMetrics: {
    bmi?: number;
    bodyFatPercentage?: number;
    skeletalMuscleMass?: number;
    boneMass?: number;
    bodyWaterPercentage?: number;
  } = {}
) {
  // Prepare data for insertion
  const weighInData = await prepareWeighInData(
    supabase,
    weight, 
    date, 
    currentPeriod?.id || null,
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

  // Update current weight in profile
  try {
    await updateProfile({ currentWeight: weight });
  } catch (profileError) {
    console.error('Error updating profile with new weight:', profileError);
  }
  
  // Update projected end date for the period if applicable
  if (currentPeriod?.id && currentPeriod.type === 'weightLoss') {
    try {
      const newProjectedEndDate = await calculateProjectedEndDateFromWeights(
        supabase,
        currentPeriod.id, 
        weight,
        calculateProjectedEndDate
      );
      
      if (newProjectedEndDate) {
        await updateProjectedEndDate(supabase, currentPeriod.id, newProjectedEndDate);
      }
    } catch (e) {
      console.error("Error updating projected end date:", e);
    }
  }

  return data;
}
