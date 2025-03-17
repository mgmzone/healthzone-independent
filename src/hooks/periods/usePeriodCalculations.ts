
import { addWeeks } from 'date-fns';

export function usePeriodCalculations() {
  const calculateProjectedEndDate = (startWeight: number, targetWeight: number, weightLossPerWeek: number, startDate: Date) => {
    // Only calculate for weight loss
    if (startWeight <= targetWeight || weightLossPerWeek <= 0) return undefined;
    
    // Calculate total weight to lose
    const totalWeightToLose = startWeight - targetWeight;
    
    // Calculate weeks needed based on the target rate
    const weeksNeeded = Math.ceil(totalWeightToLose / weightLossPerWeek);
    
    // Set a practical maximum on projected duration (2 years)
    const maxWeeks = 104;
    const adjustedWeeks = Math.min(weeksNeeded, maxWeeks);
    
    console.log(`Calculating initial projected end date: ${weeksNeeded} weeks needed to lose ${totalWeightToLose} at ${weightLossPerWeek}/week`);
    
    return addWeeks(startDate, adjustedWeeks);
  };

  return {
    calculateProjectedEndDate
  };
}
