
/**
 * Calculate weight range for y-axis with better padding and rounding
 */
export const calculateWeightRange = (
  weights: number[],
  targetWeight?: number
) => {
  // Filter out any invalid weights
  const validWeights = weights.filter(w => w !== null && w !== undefined && !isNaN(w));
  
  if (validWeights.length === 0) {
    return { minWeight: 0, maxWeight: 100 }; // Default range for empty data
  }
  
  // Include target weight in range calculation if provided
  const allWeights = targetWeight ? [...validWeights, targetWeight] : validWeights;
  
  const min = Math.min(...allWeights);
  const max = Math.max(...allWeights);
  
  // Ensure there's always space at the top and bottom of the chart (15% padding)
  const range = max - min;
  const padding = Math.max(range * 0.15, 5); // At least 5 units of padding
  
  // Round values nicely
  const minWeight = Math.floor(min - padding);
  const maxWeight = Math.ceil(max + padding);
  
  console.log('Weight range calculation:', { 
    min, max, range, padding, minWeight, maxWeight,
    weightsCount: validWeights.length,
    targetWeight
  });
  
  return { minWeight, maxWeight };
};
