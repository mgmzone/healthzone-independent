
/**
 * Calculate how many days it should take to reach target weight based on a 
 * gradual weight change model that decreases to a sustainable rate over time
 */
export const calculateDaysToTarget = (
  startWeight: number,
  targetWeight: number,
  avgDailyChange: number,
  finalSustainableRate: number,
  isWeightLoss: boolean
): number => {
  // This model assumes gradual rate decrease
  let simulatedWeight = startWeight;
  let dayCounter = 0;
  
  // We'll simulate day by day until we reach the target weight
  while ((isWeightLoss && simulatedWeight > targetWeight) || 
         (!isWeightLoss && simulatedWeight < targetWeight)) {
    
    // Calculate progress factor (0 to 1)
    const progressFactor = isWeightLoss 
      ? (startWeight - simulatedWeight) / (startWeight - targetWeight) 
      : (simulatedWeight - startWeight) / (targetWeight - startWeight);
    
    // Adjust daily rate based on progress - gradually decrease to sustainable rate
    const adjustedDailyRate = Math.abs(avgDailyChange) - 
                            (Math.abs(avgDailyChange) - finalSustainableRate) * 
                            Math.min(1, progressFactor * 1.5);
    
    // Apply the daily change
    if (isWeightLoss) {
      simulatedWeight -= adjustedDailyRate;
    } else {
      simulatedWeight += adjustedDailyRate;
    }
    
    dayCounter++;
    
    // Safety exit if taking too long
    if (dayCounter > 730) {
      console.log('Forecast simulation reached maximum days limit');
      break;
    }
  }
  
  console.log(`Estimated days to target using gradual model: ${dayCounter}`);
  return dayCounter;
};
