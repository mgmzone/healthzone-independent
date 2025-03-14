
// This file re-exports all the utilities for backward compatibility
import { calculateChartData } from './utils/weightForecastCalculator';
import { calculateWeightRange } from './utils/chartRangeCalculator';
import { formatDateForDisplay } from './utils/dateFormatters';
import { WeeklyWeightData, ProjectionResult } from './utils/types';

// Re-export types
export type { WeeklyWeightData, ProjectionResult };

// Re-export functions
export { calculateChartData, calculateWeightRange, formatDateForDisplay };
