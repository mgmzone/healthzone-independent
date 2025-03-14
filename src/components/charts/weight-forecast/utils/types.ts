
import { WeighIn, Period } from '@/lib/types';

export interface WeeklyWeightData {
  week: number;
  date: Date;
  weight: number;
  isProjected: boolean;
}

export interface ProjectionResult {
  chartData: WeeklyWeightData[];
  targetDate: Date | null;
}
