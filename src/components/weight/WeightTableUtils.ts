
import { convertWeight as convertWeightUtil, convertToMetric as convertToMetricUtil } from '@/lib/weight/convertWeight';

export const convertWeight = (weight: number | undefined, isImperial: boolean) => {
  if (!weight) return '-';
  return convertWeightUtil(weight, isImperial).toFixed(1);
};

export const convertMuscleOrBoneMass = (mass: number | undefined, isImperial: boolean) => {
  if (!mass) return '-';
  return convertWeightUtil(mass, isImperial).toFixed(1);
};

export const formatPercentage = (value: number | undefined) => {
  if (!value) return '-';
  return `${value.toFixed(1)}%`;
};

// Convert back to kg for database
export const convertToMetric = (value: string, isImperial: boolean) => {
  const num = parseFloat(value);
  if (isNaN(num)) return undefined;
  return convertToMetricUtil(num, isImperial);
};
