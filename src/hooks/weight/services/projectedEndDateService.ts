
import { SupabaseClient } from '@supabase/supabase-js';
import { usePeriodCalculations } from '@/hooks/periods/usePeriodCalculations';
import { generateForecastPoints } from '@/components/charts/weight-forecast/utils/forecastGenerator';

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
    
    // Sort weigh-ins by date (newest first)
    const sortedWeighIns = [...weighIns].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Get the latest weigh-in
    const latestWeighIn = {
      date: new Date(sortedWeighIns[0].date),
      weight: currentWeight // Use the new weight we're adding
    };
    
    // Calculate a preliminary end date using the period calculation method
    // This gives us a reasonable starting point
    const prelimEndDate = calculateProjectedEndDate(
      currentWeight,
      periodData.target_weight,
      periodData.weight_loss_per_week,
      new Date()
    );
    
    console.log('Preliminary end date calculation:', prelimEndDate);
    
    // Use the forecast generator to get a more accurate end date
    const forecastPoints = generateForecastPoints(
      latestWeighIn,
      periodData.target_weight,
      prelimEndDate,
      periodData.weight_loss_per_week
    );
    
    // Check if forecast was generated successfully and has at least one point
    if (forecastPoints.length > 0) {
      // Find the point where we first hit the target weight
      const targetPoint = forecastPoints.find(point => 
        Math.abs(point.weight - periodData.target_weight) < 0.1
      );
      
      if (targetPoint) {
        console.log('Target point found in forecast:', targetPoint.date, 'with weight', targetPoint.weight);
        return new Date(targetPoint.date);
      }
      
      // If no exact target point found, use the last point
      const lastPoint = forecastPoints[forecastPoints.length - 1];
      console.log('Using last forecast point as projected end date:', lastPoint.date, 'with weight', lastPoint.weight);
      return new Date(lastPoint.date);
    }
    
    // Fall back to the calculation from usePeriodCalculations if forecast generation fails
    console.log('Falling back to period calculations for projected end date');
    return calculateProjectedEndDate(
      currentWeight, 
      periodData.target_weight, 
      periodData.weight_loss_per_week, 
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
