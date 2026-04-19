
import { SupabaseClient } from '@supabase/supabase-js';
import { usePeriodCalculations } from '@/hooks/periods/usePeriodCalculations';
import { generateForecastPoints } from '@/components/charts/weight-forecast/utils/forecast/forecastGenerator';

/**
 * Recompute the projected end date for a weight-loss period after a new
 * weigh-in lands, and return it to be stored in the DB. Uses the same
 * generator as the chart, so the stored date agrees with what the user sees.
 */
export async function calculateProjectedEndDateFromWeights(
  supabase: SupabaseClient,
  periodId: string,
  currentWeight: number,
  calculateProjectedEndDate: ReturnType<typeof usePeriodCalculations>['calculateProjectedEndDate']
) {
  try {
    const { data: periodData, error: periodError } = await supabase
      .from('periods')
      .select('*')
      .eq('id', periodId)
      .single();

    if (periodError || !periodData) return null;
    if (periodData.type !== 'weightLoss') return null;

    // Fetch all weigh-ins for this period, ascending by date.
    const { data: weighIns, error: weighInsError } = await supabase
      .from('weigh_ins')
      .select('*')
      .eq('period_id', periodId)
      .order('date', { ascending: true });

    // Build a history that includes the weigh-in being submitted. If a row
    // already exists for the anchor's date we overwrite its weight; otherwise
    // we append. Ascending order is guaranteed because either the new entry
    // is today (≥ every existing date) or it matches an existing row.
    const history = (weighIns || []).map((w) => ({
      date: new Date(w.date),
      weight: w.weight,
    }));

    const anchorDate = history.length ? history[history.length - 1].date : new Date();
    const lastIndex = history.length - 1;
    if (
      lastIndex >= 0 &&
      Math.abs(history[lastIndex].date.getTime() - anchorDate.getTime()) < 60_000
    ) {
      history[lastIndex] = { date: anchorDate, weight: currentWeight };
    } else {
      history.push({ date: anchorDate, weight: currentWeight });
    }

    // Early target-reached check — return today so downstream UI flips.
    if (currentWeight - periodData.target_weight < 0.2) {
      return new Date();
    }

    const result = generateForecastPoints(
      history,
      periodData.target_weight,
      periodData.weight_loss_per_week
    );

    if (result.projectedEndDate) return result.projectedEndDate;

    // Fall back to the period's linear calculation when the forecaster can't
    // (too little data, or user's observed rate isn't heading toward target
    // and there's no planned rate to fall back on).
    return calculateProjectedEndDate(
      currentWeight,
      periodData.target_weight,
      periodData.weight_loss_per_week,
      new Date()
    );
  } catch (error) {
    console.error('Error calculating projected end date:', error);
    return null;
  }
}

export async function updateProjectedEndDate(
  supabase: SupabaseClient,
  periodId: string,
  projectedEndDate: Date
) {
  const updateResult = await supabase
    .from('periods')
    .update({ projected_end_date: projectedEndDate.toISOString() })
    .eq('id', periodId);

  if (updateResult.error) {
    console.error('Error updating projected end date:', updateResult.error);
    return false;
  }
  return true;
}
