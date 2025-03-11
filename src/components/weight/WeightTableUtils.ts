
export const convertWeight = (weight: number | undefined, isImperial: boolean) => {
  if (!weight) return '-';
  return isImperial ? (weight * 2.20462).toFixed(1) : weight.toFixed(1);
};

export const convertMuscleOrBoneMass = (mass: number | undefined, isImperial: boolean) => {
  if (!mass) return '-';
  return isImperial ? (mass * 2.20462).toFixed(1) : mass.toFixed(1);
};

export const formatPercentage = (value: number | undefined) => {
  if (!value) return '-';
  return `${value.toFixed(1)}%`;
};

// Convert back to kg for database
export const convertToMetric = (value: string, isImperial: boolean) => {
  const num = parseFloat(value);
  if (isNaN(num)) return undefined;
  return isImperial ? num / 2.20462 : num;
};
