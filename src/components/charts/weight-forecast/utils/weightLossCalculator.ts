
// This file is now a lightweight facade that imports and re-exports functionality
// from the more specialized utility files
import { WeeklyWeightData, ProjectionResult } from './types';
import { calculateWeightProjection } from './projectionCalculator';

// Re-export the main function for backward compatibility
export { calculateWeightProjection };
