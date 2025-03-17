
import { addWeeks } from 'date-fns';

export function usePeriodCalculations() {
  const calculateProjectedEndDate = (startWeight: number, targetWeight: number, weightLossPerWeek: number, startDate: Date) => {
    // Only calculate for weight loss
    if (startWeight <= targetWeight || weightLossPerWeek <= 0) return undefined;
    
    // Calculate total weight to lose
    const totalWeightToLose = startWeight - targetWeight;
    
    // We want to use the specified rate for the first ~80% of the journey,
    // then taper to 1 lb/week for the last ~20%
    
    // Calculate how many pounds we'll lose at the specified rate
    const poundsAtNormalRate = totalWeightToLose * 0.8; // 80% of weight at normal rate
    
    // Calculate how many pounds we'll lose at the tapered rate (1lb/week)
    const poundsAtTaperedRate = totalWeightToLose * 0.2; // 20% of weight at tapered rate
    
    // Calculate weeks needed for each phase
    const weeksAtNormalRate = poundsAtNormalRate / weightLossPerWeek;
    const weeksAtTaperedRate = poundsAtTaperedRate / 1.0; // 1lb per week
    
    // Total weeks needed (rounded up) with a small buffer for the final approach
    const totalWeeksNeeded = Math.ceil(weeksAtNormalRate + weeksAtTaperedRate) + 1;
    
    // Set a practical maximum on projected duration (2 years)
    const maxWeeks = 104;
    const adjustedWeeks = Math.min(totalWeeksNeeded, maxWeeks);
    
    console.log(`Calculating projected end date: ${totalWeeksNeeded} weeks needed to lose ${totalWeightToLose} lbs. ` +
                `Initial rate: ${weightLossPerWeek}/week for ${weeksAtNormalRate.toFixed(1)} weeks, ` +
                `then 1 lb/week for ${weeksAtTaperedRate.toFixed(1)} weeks.`);
    
    return addWeeks(startDate, adjustedWeeks);
  };

  return {
    calculateProjectedEndDate
  };
}
