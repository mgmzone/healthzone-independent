
import { SimpleWeightData } from './weight-forecast/utils/types';
import { calculateWeightRange } from './weight-forecast/utils/weightRangeCalculator';
import { formatDateForDisplay } from './weight-forecast/utils/dateFormatter';
import { generateForecastPoints } from './weight-forecast/utils/forecastGenerator';

// Re-export the functions and types
export {
  calculateWeightRange,
  formatDateForDisplay,
  generateForecastPoints,
  type SimpleWeightData
};
