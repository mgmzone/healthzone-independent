
import { addWeeks } from 'date-fns';

export function usePeriodCalculations() {
  const calculateProjectedEndDate = (startWeight: number, targetWeight: number, weightLossPerWeek: number, startDate: Date) => {
    // Only calculate for weight loss
    if (startWeight <= targetWeight || weightLossPerWeek <= 0) return undefined;
    
    // Calculate total weight to lose
    const totalWeightToLose = startWeight - targetWeight;
    
    // Calculate weeks needed using a curved model instead of linear
    // This aligns with how the chart calculates the forecast
    
    // Start with base calculation
    const linearWeeksNeeded = totalWeightToLose / weightLossPerWeek;
    
    // Apply curve adjustment - weight loss slows as you approach target
    // Increasing to account for the significant slowdown in the curve model
    // Adjusted multiplier from 3.1 to 2.5 to better match the enhanced curve
    const curvedWeeksNeeded = Math.ceil(linearWeeksNeeded * 2.5);
    
    // Add two more weeks to allow for a smoother end to the curve
    const adjustedWeeksWithBuffer = curvedWeeksNeeded + 2;
    
    // Set a practical maximum on projected duration (2 years)
    const maxWeeks = 104;
    const adjustedWeeks = Math.min(adjustedWeeksWithBuffer, maxWeeks);
    
    console.log(`Calculating projected end date using curved model: ${curvedWeeksNeeded} weeks (was ${linearWeeksNeeded.toFixed(1)} linear) needed to lose ${totalWeightToLose} at ${weightLossPerWeek}/week, with 2 week buffer = ${adjustedWeeksWithBuffer}`);
    
    return addWeeks(startDate, adjustedWeeks);
  };

  return {
    calculateProjectedEndDate
  };
}
