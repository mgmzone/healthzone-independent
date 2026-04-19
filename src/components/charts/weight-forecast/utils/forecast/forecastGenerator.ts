// Weight forecast math.
//
// We anchor the forecast at the user's actual most recent weigh-in (no
// smoothed / phantom starting value — users were confused when the forecast
// line began at a different weight than the one they just logged), estimate
// their current daily rate of loss via linear regression over recent history,
// and project forward with an exponential-decay curve toward target.
//
//   weight(t) = target + (anchor − target) · exp(−k · t)
//
// That shape naturally flattens as it approaches target, which matches
// real-world physiology (smaller body → smaller deficit → slower loss) better
// than the old weighted-blend curve, which produced a near-linear line.
//
// The rate `k` is fit so the curve's initial slope equals the user's observed
// recent slope, not the period's planned rate. This makes the forecast
// *responsive to reality*: if the user is losing faster than planned, the
// projected end date pulls in; if they've stalled, it pushes out (or the
// forecast disappears entirely when the rate isn't heading toward target).

import { addDays } from 'date-fns';

export interface WeighInPoint {
  date: Date;
  weight: number;
}

export interface ForecastPoint {
  date: Date;
  weight: number;
  isForecast: true;
}

// "Reached" the target when the exponential gets within this much of it.
// Exponentials never literally touch; 2% of the journey (floored at 0.2) is
// close enough to call it done.
const THRESHOLD_FRACTION = 0.02;
const MIN_THRESHOLD = 0.2;

const POINT_INTERVAL_DAYS = 2;
const MAX_PROJECTION_DAYS = 365 * 3;

// Regression window for estimating the user's actual recent daily rate.
const REGRESSION_LOOKBACK_DAYS = 21;
const MIN_REGRESSION_POINTS = 3;

/**
 * Ordinary least-squares slope of weight vs. days-since-first-point over the
 * recent lookback window. Returns null when there's not enough data or the
 * points are all on the same day (zero variance in x).
 */
function estimateDailyRate(historyOldestFirst: WeighInPoint[]): number | null {
  if (historyOldestFirst.length < MIN_REGRESSION_POINTS) return null;

  const anchorDate = historyOldestFirst[historyOldestFirst.length - 1].date;
  const cutoff = addDays(anchorDate, -REGRESSION_LOOKBACK_DAYS).getTime();
  const window = historyOldestFirst.filter((p) => p.date.getTime() >= cutoff);
  if (window.length < MIN_REGRESSION_POINTS) return null;

  const t0 = window[0].date.getTime();
  const day = 24 * 60 * 60 * 1000;
  const xs = window.map((p) => (p.date.getTime() - t0) / day);
  const ys = window.map((p) => p.weight);

  const n = xs.length;
  const meanX = xs.reduce((s, v) => s + v, 0) / n;
  const meanY = ys.reduce((s, v) => s + v, 0) / n;

  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX;
    num += dx * (ys[i] - meanY);
    den += dx * dx;
  }
  if (den === 0) return null;
  return num / den;
}

export interface ForecastResult {
  points: ForecastPoint[];
  // Last point's date (= projected completion). Null when no forecast.
  projectedEndDate: Date | null;
  // True if the user is already at/near target — no forecast generated.
  targetReached: boolean;
  // The daily rate used for the projection (negative = losing).
  // Null when falling back to planned rate.
  observedDailyRate: number | null;
}

/**
 * Build a weight-forecast curve.
 *
 * @param historyOldestFirst All period weigh-ins in the display unit,
 *   ascending by date. The last element is the anchor.
 * @param targetWeight Target in the same unit.
 * @param fallbackWeeklyRate Period's planned weekly rate (positive magnitude).
 *   Used only when the user's observed rate doesn't head toward the target
 *   (e.g., gaining during a loss period, or too few data points for
 *   regression).
 */
export function generateForecastPoints(
  historyOldestFirst: WeighInPoint[],
  targetWeight: number | undefined,
  fallbackWeeklyRate?: number
): ForecastResult {
  const empty: ForecastResult = {
    points: [],
    projectedEndDate: null,
    targetReached: false,
    observedDailyRate: null,
  };

  if (!historyOldestFirst.length || targetWeight == null) return empty;

  const anchor = historyOldestFirst[historyOldestFirst.length - 1];
  const signedGap = anchor.weight - targetWeight;
  const gap = Math.abs(signedGap);

  // Already at / within-spitting-distance-of target.
  if (gap < MIN_THRESHOLD) {
    return { ...empty, targetReached: true };
  }

  const isLoss = signedGap > 0;
  const observedDailyRate = estimateDailyRate(historyOldestFirst);

  // The rate must point toward the target, otherwise exponential decay fit
  // diverges. If the observed rate is wrong-way or missing, fall back to the
  // period's planned rate so new users still see *some* forecast.
  const observedGoesRight =
    observedDailyRate != null && (isLoss ? observedDailyRate < 0 : observedDailyRate > 0);

  let dailyRate: number;
  if (observedGoesRight) {
    dailyRate = observedDailyRate!;
  } else if (fallbackWeeklyRate && fallbackWeeklyRate > 0) {
    dailyRate = (isLoss ? -1 : 1) * (fallbackWeeklyRate / 7);
  } else {
    return empty;
  }

  // Fit k so weight(t) = target + signedGap · exp(−k·t) has initial slope
  // equal to dailyRate: d/dt weight(0) = −k · signedGap = dailyRate.
  const k = -dailyRate / signedGap;
  if (!Number.isFinite(k) || k <= 0) return empty;

  // Days until within threshold of target.
  //   gap · exp(−k·t) = threshold  ⇒  t = ln(gap / threshold) / k
  const threshold = Math.max(MIN_THRESHOLD, THRESHOLD_FRACTION * gap);
  const daysToReach = Math.min(
    MAX_PROJECTION_DAYS,
    Math.max(1, Math.ceil(Math.log(gap / threshold) / k))
  );

  // Emit the anchor point as the first forecast point so the line visually
  // continues from the user's real last weigh-in (no jump).
  const points: ForecastPoint[] = [
    { date: anchor.date, weight: anchor.weight, isForecast: true },
  ];

  for (let d = POINT_INTERVAL_DAYS; d < daysToReach; d += POINT_INTERVAL_DAYS) {
    const w = targetWeight + signedGap * Math.exp(-k * d);
    points.push({ date: addDays(anchor.date, d), weight: w, isForecast: true });
  }

  // Snap the terminal point exactly to target so the chart meets the target
  // reference line cleanly instead of asymptoting just above/below it.
  const endDate = addDays(anchor.date, daysToReach);
  points.push({ date: endDate, weight: targetWeight, isForecast: true });

  return {
    points,
    projectedEndDate: endDate,
    targetReached: false,
    observedDailyRate: observedGoesRight ? observedDailyRate : null,
  };
}
