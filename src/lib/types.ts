export interface User {
  id: string;
  name: string;
  email: string;
  birthDate: Date;
  gender: 'male' | 'female' | 'other';
  height: number;
  currentWeight: number;
  targetWeight?: number;
  fitnessLevel: 'sedentary' | 'light' | 'moderate' | 'active';
  exerciseMinutesPerDay: number;
  healthGoals: string;
  measurementUnit: 'imperial' | 'metric';
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  startingWeight?: number;
  targetMealsPerDay: number;
  isAdmin: boolean;
  claudeApiKey?: string;
  aiPrompt?: string;
  proteinTargetMin?: number;
  proteinTargetMax?: number;
}

export interface PeriodMilestone {
  id: string;
  periodId: string;
  userId: string;
  name: string;
  date: string; // YYYY-MM-DD
  isPriority: boolean;
  notes?: string;
  sortOrder: number;
}

export interface Period {
  id: string;
  userId: string;
  startDate: Date | string;
  endDate?: Date | string;
  originalEndDate?: Date | string;
  type: 'weightLoss' | 'maintenance';
  startWeight: number;
  targetWeight: number;
  fastingSchedule: string;
  weightLossPerWeek: number;
  projectedEndDate?: Date | string;
}

export interface WeighIn {
  id: string;
  userId: string;
  periodId: string;
  date: Date;
  weight: number;
  bmi?: number;
  bodyFatPercentage?: number;
  skeletalMuscleMass?: number;
  boneMass?: number;
  bodyWaterPercentage?: number;
}

export interface ExerciseLog {
  id: string;
  userId: string;
  date: Date;
  type: 'walk' | 'run' | 'bike' | 'elliptical' | 'other';
  minutes: number;
  intensity: 'low' | 'medium' | 'high';
  steps?: number;
  distance?: number;
  lowestHeartRate?: number;
  highestHeartRate?: number;
  averageHeartRate?: number;
}

export interface FastingLog {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  fastingHours?: number;
  eatingWindowHours?: number;
}

export interface HealthStat {
  id: string;
  userId: string;
  date: Date;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  restingHeartRate?: number;
}

export interface MealLog {
  id: string;
  userId: string;
  date: Date;
  mealSlot: string;
  proteinGrams?: number;
  carbsGrams?: number;
  fatGrams?: number;
  sodiumMg?: number;
  calories?: number;
  proteinSource?: string;
  irritantViolation: boolean;
  irritantNotes?: string;
  antiInflammatory: boolean;
  notes?: string;
  aiAssessment?: string;
  aiProteinEstimate?: number;
}

export interface ProteinSource {
  id: string;
  userId: string;
  name: string;
  typicalProteinGrams?: number;
  isAntiInflammatory: boolean;
  sortOrder: number;
}

export interface DailyGoal {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category: 'dietary' | 'hydration' | 'supplement' | 'lifestyle';
  sortOrder: number;
  isActive: boolean;
}

export interface DailyGoalEntry {
  id: string;
  userId: string;
  goalId: string;
  date: Date;
  met: boolean;
  notes?: string;
}

export const DEFAULT_MEAL_NAMES = ['Meal 1', 'Meal 2', 'Meal 3'];

export const PROTEIN_TARGET_MIN = 130;
export const PROTEIN_TARGET_MAX = 150;

export const GOAL_CATEGORIES = ['dietary', 'hydration', 'supplement', 'lifestyle'] as const;
export type GoalCategory = typeof GOAL_CATEGORIES[number];

export type TimeFilter = 'week' | 'month' | 'period';

// Mock data
export const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  birthDate: new Date(1990, 0, 1),
  gender: 'male',
  height: 180,
  currentWeight: 90,
  fitnessLevel: 'moderate',
  exerciseMinutesPerDay: 30,
  healthGoals: 'Lose weight and improve overall fitness',
  measurementUnit: 'metric',
  firstName: 'John',
  lastName: 'Doe',
  avatarUrl: '',
  startingWeight: 90,
  targetMealsPerDay: 3,
  isAdmin: false,
};

export const mockWeighIns: WeighIn[] = [
  { id: '1', userId: '1', periodId: '1', date: new Date(2023, 0, 1), weight: 90, bmi: 27.8, bodyFatPercentage: 25 },
  { id: '2', userId: '1', periodId: '1', date: new Date(2023, 0, 3), weight: 89.5, bmi: 27.6, bodyFatPercentage: 24.8 },
  { id: '3', userId: '1', periodId: '1', date: new Date(2023, 0, 5), weight: 89.2, bmi: 27.5, bodyFatPercentage: 24.6 },
  { id: '4', userId: '1', periodId: '1', date: new Date(2023, 0, 8), weight: 88.7, bmi: 27.4, bodyFatPercentage: 24.4 },
  { id: '5', userId: '1', periodId: '1', date: new Date(2023, 0, 10), weight: 88.3, bmi: 27.2, bodyFatPercentage: 24.2 },
  { id: '6', userId: '1', periodId: '1', date: new Date(2023, 0, 12), weight: 87.9, bmi: 27.1, bodyFatPercentage: 24.0 },
  { id: '7', userId: '1', periodId: '1', date: new Date(2023, 0, 15), weight: 87.5, bmi: 27.0, bodyFatPercentage: 23.8 },
  { id: '8', userId: '1', periodId: '1', date: new Date(2023, 0, 17), weight: 87.1, bmi: 26.9, bodyFatPercentage: 23.6 },
  { id: '9', userId: '1', periodId: '1', date: new Date(2023, 0, 19), weight: 86.8, bmi: 26.8, bodyFatPercentage: 23.4 },
  { id: '10', userId: '1', periodId: '1', date: new Date(2023, 0, 22), weight: 86.4, bmi: 26.7, bodyFatPercentage: 23.2 },
];

export const mockExerciseLogs: ExerciseLog[] = [
  { id: '1', userId: '1', date: new Date(2023, 0, 1), type: 'walk', minutes: 30, intensity: 'medium', steps: 4500, distance: 3.2 },
  { id: '2', userId: '1', date: new Date(2023, 0, 2), type: 'run', minutes: 20, intensity: 'high', steps: 3800, distance: 2.8 },
  { id: '3', userId: '1', date: new Date(2023, 0, 3), type: 'bike', minutes: 45, intensity: 'medium', distance: 15 },
  { id: '4', userId: '1', date: new Date(2023, 0, 5), type: 'elliptical', minutes: 30, intensity: 'medium', distance: 5 },
  { id: '5', userId: '1', date: new Date(2023, 0, 6), type: 'walk', minutes: 40, intensity: 'low', steps: 5200, distance: 3.8 },
  { id: '6', userId: '1', date: new Date(2023, 0, 8), type: 'run', minutes: 25, intensity: 'high', steps: 4200, distance: 3.2 },
  { id: '7', userId: '1', date: new Date(2023, 0, 10), type: 'bike', minutes: 50, intensity: 'medium', distance: 18 },
];

export const mockFastingLogs: FastingLog[] = [
  { id: '1', userId: '1', startTime: new Date(2023, 0, 1, 20, 0), endTime: new Date(2023, 0, 2, 12, 0), fastingHours: 16, eatingWindowHours: 8 },
  { id: '2', userId: '1', startTime: new Date(2023, 0, 2, 20, 0), endTime: new Date(2023, 0, 3, 12, 0), fastingHours: 16, eatingWindowHours: 8 },
  { id: '3', userId: '1', startTime: new Date(2023, 0, 3, 20, 0), endTime: new Date(2023, 0, 4, 12, 0), fastingHours: 16, eatingWindowHours: 8 },
  { id: '4', userId: '1', startTime: new Date(2023, 0, 4, 20, 0), endTime: new Date(2023, 0, 5, 12, 0), fastingHours: 16, eatingWindowHours: 8 },
  { id: '5', userId: '1', startTime: new Date(2023, 0, 5, 20, 0), endTime: new Date(2023, 0, 6, 12, 0), fastingHours: 16, eatingWindowHours: 8 },
  { id: '6', userId: '1', startTime: new Date(2023, 0, 6, 20, 0), endTime: new Date(2023, 0, 7, 12, 0), fastingHours: 16, eatingWindowHours: 8 },
  { id: '7', userId: '1', startTime: new Date(2023, 0, 7, 19, 0), endTime: new Date(2023, 0, 8, 13, 0), fastingHours: 18, eatingWindowHours: 6 },
];

export const getProgressPercentage = (current: number, start: number, target: number): number => {
  if (start === target) return 100;
  const progress = Math.abs((current - start) / (target - start)) * 100;
  return Math.min(Math.max(progress, 0), 100);
};
