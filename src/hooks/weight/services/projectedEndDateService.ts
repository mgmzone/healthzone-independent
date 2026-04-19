
import { SupabaseClient } from '@supabase/supabase-js';
import { usePeriodCalculations } from '@/hooks/periods/usePeriodCalculations';
import { generateForecastPoints } from '@/components/charts/weight-forecast/utils/forecast/forecastGenerator';
import { smoothRecentWeighIns } from '@/components/charts/weight-forecast/utils/forecast/smoothing';

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
    
    // Sort weigh-ins newest-first for picking the anchor date, then build a
    // smoothing window oldest-first with the newest slot replaced by the
    // currentWeight being submitted. This way a single spiky reading doesn't
    // lock in an overly optimistic (or pessimistic) projected end date.
    const sortedWeighIns = [...weighIns].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const smoothingWindow = sortedWeighIns
      .slice(0, 7)
      .map((w, i) => ({
        date: new Date(w.date),
        weight: i === 0 ? currentWeight : w.weight,
      }))
      .reverse();

    const smoothed = smoothRecentWeighIns(smoothingWindow, 7);
    const anchorWeight = smoothed?.weight ?? currentWeight;
    const anchorDate = new Date(sortedWeighIns[0].date);

    // If the smoothed weight already meets the target, there's nothing to
    // project — return today so downstream UI shows target-reached.
    if (anchorWeight <= periodData.target_weight) {
      return new Date();
    }

    const latestWeighIn = { date: anchorDate, weight: anchorWeight };

    // Preliminary linear ETA using the period's target rate — the forecast
    // generator will curve around this to produce the actual projection.
    const prelimEndDate = calculateProjectedEndDate(
      anchorWeight,
      periodData.target_weight,
      periodData.weight_loss_per_week,
      new Date()
    );

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
