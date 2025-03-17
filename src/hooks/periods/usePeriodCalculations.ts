
import { addWeeks } from 'date-fns';

export function usePeriodCalculations() {
  const calculateProjectedEndDate = (startWeight: number, targetWeight: number, weightLossPerWeek: number, startDate: Date) => {
    // Only calculate for weight loss
    if (startWeight <= targetWeight || weightLossPerWeek <= 0) return undefined;
    
    // Calculate total weight to lose
    const totalWeightToLose = startWeight - targetWeight;
    
    // Calculate weeks needed with a realistic approach
    // This matches the algorithm in forecastGenerator.ts to ensure consistency
    
    // Base calculation - how many weeks at the specified rate
    const baseWeeks = totalWeightToLose / weightLossPerWeek;
    
    // Add additional buffer time for the slowdown that naturally occurs
    // This multiplier ensures the projection is realistic and matches the chart
    const adjustmentFactor = 1.15; // 15% buffer to account for slowdown
    const adjustedWeeks = baseWeeks * adjustmentFactor;
    
    // Round up and add a small buffer for final approach
    const totalWeeksNeeded = Math.ceil(adjustedWeeks) + 1;
    
    // Set a practical maximum on projected duration (2 years)
    const maxWeeks = 104;
    const adjustedWeeks2 = Math.min(totalWeeksNeeded, maxWeeks);
    
    console.log(`Calculating projected end date: ${adjustedWeeks2} weeks needed to lose ${totalWeightToLose} units. ` +
                `Base estimate: ${baseWeeks.toFixed(1)} weeks at ${weightLossPerWeek}/week, ` +
                `Adjusted with ${((adjustmentFactor - 1) * 100).toFixed(0)}% buffer.`);
    
    return addWeeks(startDate, adjustedWeeks2);
  };

  return {
    calculateProjectedEndDate
  };
}
