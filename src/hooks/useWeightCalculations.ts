
import { WeighIn } from '@/lib/types';

export const useWeightCalculations = (weighIns: WeighIn[], isImperial: boolean) => {
  // Convert weight if needed based on measurement unit
  const convertWeight = (weight: number) => {
    if (!weight) return 0;
    return isImperial ? weight * 2.20462 : weight;
  };

  const getLatestWeight = () => {
    if (weighIns.length === 0) return null;
    return weighIns[0];
  };

  const calculateWeightChange = (days: number) => {
    if (weighIns.length < 2) return null;
    
    const latestWeight = weighIns[0];
    const latestDate = new Date(latestWeight.date);
    
    const targetDate = new Date(latestDate);
    targetDate.setDate(targetDate.getDate() - days);
    
    let closestPreviousWeighIn = null;
    
    for (let i = 1; i < weighIns.length; i++) {
      const weighInDate = new Date(weighIns[i].date);
      if (weighInDate <= targetDate || i === weighIns.length - 1) {
        closestPreviousWeighIn = weighIns[i];
        break;
      }
    }
    
    if (!closestPreviousWeighIn) return null;
    
    // Calculate the exact weight difference
    const latestWeightConverted = convertWeight(latestWeight.weight);
    const previousWeightConverted = convertWeight(closestPreviousWeighIn.weight);
    const changeValue = latestWeightConverted - previousWeightConverted;
    
    return {
      value: changeValue.toFixed(1),
      days: Math.round((latestDate.getTime() - new Date(closestPreviousWeighIn.date).getTime()) / (1000 * 60 * 60 * 24))
    };
  };

  // Calculate weight change between first and last weigh-ins
  const calculateTotalChange = () => {
    if (weighIns.length < 2) return "0.0";
    
    const latestWeight = weighIns[0];
    const firstWeight = weighIns[weighIns.length - 1];
    
    // Calculate the exact weight difference
    const latestWeightConverted = convertWeight(latestWeight.weight);
    const firstWeightConverted = convertWeight(firstWeight.weight);
    const changeValue = latestWeightConverted - firstWeightConverted;
    
    return changeValue.toFixed(1);
  };

  return {
    convertWeight,
    getLatestWeight,
    calculateWeightChange,
    calculateTotalChange
  };
};
