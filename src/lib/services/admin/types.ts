
export interface UserStats {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  lastLogin: string | null;
  isProfileComplete: boolean;
  hasActivePeriod: boolean;
  weighInsCount: number;
  fastsCount: number;
  exercisesCount: number;
}

export interface SystemStats {
  totalUsers: number;
  activePeriods: number;
  totalWeighIns: number;
  totalFasts: number;
  totalExercises: number;
}

export interface ActivityLogItem {
  date: Date | string;
  type: 'weighIn' | 'fast' | 'exercise';
}
