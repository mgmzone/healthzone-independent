// Robust "current weight" estimate that ignores single-day outliers (water
// retention, ate late, bad scale reading) by trimming the highest and lowest
// values from the recent window.
//
// Without smoothing, a single bad weigh-in polluted the forecast — the slope
// was computed from `latestWeighIn.weight` directly, so one +5 lb spike could
// flip the trajectory or push the projected end date out by weeks.

const DEFAULT_LOOKBACK = 7;

export interface SmoothingInput {
  date: Date;
  weight: number;
}

export interface SmoothedAnchor {
  // The date of the most recent weigh-in (the forecast should start here).
  date: Date;
  // Smoothed weight — not the user's raw latest, but what their current weight
  // most plausibly is given recent variance.
  weight: number;
  // How many points contributed to the average — useful for display / debugging.
  samples: number;
}

export function smoothRecentWeighIns(
  sortedOldestFirst: SmoothingInput[],
  lookback: number = DEFAULT_LOOKBACK
): SmoothedAnchor | null {
  if (!sortedOldestFirst.length) return null;

  const window = sortedOldestFirst.slice(-lookback);
  const anchorDate = window[window.length - 1].date;

  // With ≤2 points we can't meaningfully trim; just use the latest value.
  if (window.length <= 2) {
    return { date: anchorDate, weight: window[window.length - 1].weight, samples: window.length };
  }

  // Trim the single highest and single lowest weight, then average the rest.
  // Robust to one bad reading in either direction without needing a full median.
  const weights = window.map((p) => p.weight).sort((a, b) => a - b);
  const trimmed = weights.slice(1, -1);
  const mean = trimmed.reduce((s, w) => s + w, 0) / trimmed.length;

  return { date: anchorDate, weight: mean, samples: window.length };
}
