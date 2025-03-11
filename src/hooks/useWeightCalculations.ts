
import { WeighIn } from '@/lib/types';
import { convertWeight } from '@/lib/weight/convertWeight';
import { formatWeightValue } from '@/lib/weight/formatWeight';
import { filterWeighInsByTimePeriod } from '@/lib/weight/weightFilters';
import { 
  getLatestWeight,
  getStartingWeight,
  calculateWeightChange,
  calculateFilteredWeightChange,
  calculateTotalChange
} from '@/lib/weight/weightCalculations';

export const useWeightCalculations = (weighIns: WeighIn[], isImperial: boolean) => {
  return {
    // Re-export the functions with pre-bound weighIns and isImperial
    convertWeight: (weight: number) => convertWeight(weight, isImperial),
    getLatestWeight: () => getLatestWeight(weighIns),
    formatWeightValue,
    filterWeighInsByTimePeriod: (timePeriod: 'week' | 'month' | 'period') => 
      filterWeighInsByTimePeriod(weighIns, timePeriod),
    calculateWeightChange: (days: number) => 
      calculateWeightChange(weighIns, days, isImperial),
    calculateTotalChange: () => calculateTotalChange(weighIns, isImperial),
    calculateFilteredWeightChange: (timeFilter: 'week' | 'month' | 'period') => 
      calculateFilteredWeightChange(weighIns, timeFilter, isImperial),
    getStartingWeight: (timeFilter: 'week' | 'month' | 'period') => 
      getStartingWeight(weighIns, timeFilter, isImperial)
  };
};
