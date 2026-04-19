// Utilities for calculating end dates for weight forecasts.
import { addDays } from 'date-fns';

// Buffer added to the linear ETA so the forecast *curve* (which decelerates
// toward target) has room to converge. Proportional (~10%) clamped to sane
// bounds so a 4-week goal doesn't get a 50% pad and a year-long goal doesn't
// get a 6-week one.
const MIN_BUFFER_DAYS = 3;
const MAX_BUFFER_DAYS = 21;
const BUFFER_FRACTION = 0.10;

export const calculateProjectedEndDate = (
  lastWeighInDate: Date,
  lastWeighInWeight: number,
  targetWeight: number,
  weightLossPerWeek?: number
): Date | null => {
  if (!weightLossPerWeek || weightLossPerWeek <= 0) {
    return null;
  }

  const totalWeightChange = Math.abs(lastWeighInWeight - targetWeight);
  const weeksNeeded = totalWeightChange / weightLossPerWeek;
  const linearDays = Math.ceil(weeksNeeded * 7);

  const buffer = Math.max(
    MIN_BUFFER_DAYS,
    Math.min(MAX_BUFFER_DAYS, Math.round(linearDays * BUFFER_FRACTION))
  );

  return addDays(lastWeighInDate, linearDays + buffer);
};

export const calculateDaysToProjectedEnd = (
  lastWeighInDate: Date,
  projectedEndDate: Date
): number => {
  return Math.max(1, Math.round((projectedEndDate.getTime() - lastWeighInDate.getTime()) / (1000 * 60 * 60 * 24)));
};
