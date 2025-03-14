
// Types for our weight forecast chart

export interface SimpleWeightData {
  date: Date;
  weight: number;
}

export interface WeeklyWeightData {
  week: number;
  date: Date | string;
  weight: number;
  isProjected?: boolean;
}

export interface ProjectionResult {
  chartData: WeeklyWeightData[];
  targetDate: Date | null;
}

