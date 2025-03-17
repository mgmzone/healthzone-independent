
/**
 * This file re-exports the forecast generator from its new location.
 * This maintains backward compatibility with existing imports.
 */
import { generateForecastPoints } from './forecast/forecastGenerator';

export { generateForecastPoints };
