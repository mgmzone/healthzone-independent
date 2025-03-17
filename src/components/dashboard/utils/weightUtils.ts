
export const formatWeight = (weight: number | undefined | null, weightUnit: string): string => {
  if (weight === undefined || weight === null) return "No data";
  return `${weight.toFixed(1)} ${weightUnit}`;
};
