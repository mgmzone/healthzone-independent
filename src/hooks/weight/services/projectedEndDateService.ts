
import { SupabaseClient } from '@supabase/supabase-js';
import { usePeriodCalculations } from '@/hooks/periods/usePeriodCalculations';

/**
 * Calculates the projected end date for a weight loss period
 * based on the current weight and historical weight data
 */
export async function calculateProjectedEndDateFromWeights(
  supabase: SupabaseClient,
  periodId: string, 
  currentWeight: number,
  calculateProjectedEndDate: ReturnType<typeof usePeriodCalculations>['calculateProjectedEndDate']
) {
  try {
    // Get period details
    const { data: periodData, error: periodError } = await supabase
      .from('periods')
      .select('*')
      .eq('id', periodId)
      .single();
      
    if (periodError || !periodData) return null;
    
    // Only proceed for weight loss periods
    if (periodData.type !== 'weightLoss') return null;
    
    // Get all weigh-ins for this period
    const { data: weighIns, error: weighInsError } = await supabase
      .from('weigh_ins')
      .select('*')
      .eq('period_id', periodId)
      .order('date', { ascending: true });
      
    if (weighInsError || !weighIns || weighIns.length < 2) {
      // If we don't have enough data points, use the target weight loss rate
      // and the period starting weight
      const remainingWeight = currentWeight - periodData.target_weight;
      if (remainingWeight <= 0) return null;
      
      // Use the same algorithm as in usePeriodCalculations
      return calculateProjectedEndDate(
        currentWeight, 
        periodData.target_weight, 
        periodData.weight_loss_per_week, 
        new Date()
      );
    }
    
    // Calculate based on actual data
    const oldestWeighIn = weighIns[0];
    const latestWeight = currentWeight; // Use the new weight we're adding
    
    const startDate = new Date(oldestWeighIn.date);
    const latestDate = new Date(); // Use current date as the latest
    const daysDifference = Math.max(1, (latestDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate weight loss rate
    const totalWeightLoss = oldestWeighIn.weight - latestWeight;
    
    // Only proceed if we're actually losing weight
    if (totalWeightLoss <= 0) return null;
    
    // Get weekly rate from actual data
    const actualWeeklyRate = (totalWeightLoss / daysDifference) * 7;
    
    console.log('Add weigh-in projected end date calculation:', {
      startWeight: oldestWeighIn.weight,
      latestWeight,
      totalWeightLoss,
      daysDifference,
      actualWeeklyRate,
      targetWeight: periodData.target_weight
    });
    
    const remainingWeightToLose = latestWeight - periodData.target_weight;
    
    // If we've reached the target weight, return current date
    if (remainingWeightToLose <= 0) return new Date();
    
    // Use the same algorithm as in usePeriodCalculations
    return calculateProjectedEndDate(
      latestWeight, 
      periodData.target_weight, 
      actualWeeklyRate, 
      new Date()
    );
  } catch (error) {
    console.error("Error calculating projected end date:", error);
    return null;
  }
}

/**
 * Updates the projected end date for a weight loss period
 */
export async function updateProjectedEndDate(
  supabase: SupabaseClient,
  periodId: string,
  projectedEndDate: Date
) {
  console.log("Updating projected end date to:", projectedEndDate);
  
  const updateResult = await supabase
    .from('periods')
    .update({ projected_end_date: projectedEndDate.toISOString() })
    .eq('id', periodId);
    
  if (updateResult.error) {
    console.error("Error updating projected end date:", updateResult.error);
    return false;
  } else {
    console.log("Successfully updated projected end date to:", projectedEndDate);
    return true;
  }
}
