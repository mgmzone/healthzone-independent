import { WeeklyWeightData, ProjectionResult } from './types';

/**
 * Processes projection data to determine target date and trims projection if needed
 */
export const findTargetDate = (
  weeklyData: WeeklyWeightData[],
  targetWeekNum: number,
  targetDate: Date | null
): ProjectionResult => {
  // If we found the target date, keep projections up to 4 weeks after target date
  if (targetWeekNum > 0) {
    const maxProjectionWeek = targetWeekNum + 4; // target week plus 4 additional weeks
    
    // Filter out projections beyond our cut-off
    const filteredData = weeklyData.filter(data => 
      !data.isProjected || data.week <= maxProjectionWeek
    );
    
    return { chartData: filteredData, targetDate };
  }
  
  // If no target date was found, return all data
  return { chartData: weeklyData, targetDate };
};
