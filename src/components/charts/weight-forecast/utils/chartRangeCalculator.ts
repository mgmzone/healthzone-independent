
import { WeeklyWeightData } from './types';

/**
 * Calculate min and max weight for chart display
 */
export const calculateWeightRange = (chartData: WeeklyWeightData[], targetWeight?: number) => {
  if (chartData.length === 0) return { minWeight: 0, maxWeight: 100 };
  
  const weights = [...chartData.map(d => d.weight)];
  if (targetWeight !== undefined) {
    weights.push(targetWeight);
  }
  
  // Calculate a reasonable min/max range for the chart - round to nearest 5
  const minWeight = Math.floor(Math.min(...weights) / 5) * 5;
  const maxWeight = Math.ceil(Math.max(...weights) / 5) * 5;
  
  return { minWeight, maxWeight };
};
