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
  timeZone?: string;
  dailyReminderEnabled?: boolean;
}

// Curated milestone types; custom values (any other string) are also allowed.
export const MILESTONE_TYPES = [
  { value: 'surgery', label: 'Surgery' },
  { value: 'procedure', label: 'Procedure' },
  { value: 'appointment', label: 'Appointment' },
  { value: 'follow_up', label: 'Follow-up' },
  { value: 'medication', label: 'Medication change' },
  { value: 'personal', label: 'Personal' },
  { value: 'other', label: 'Other' },
] as const;

export function milestoneTypeLabel(type: string): string {
  return MILESTONE_TYPES.find((t) => t.value === type)?.label
    ?? type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
}

// User-level milestone (decoupled from weight-loss periods).
export interface Milestone {
  id: string;
  userId: string;
  name: string;
  type: string;      // one of MILESTONE_TYPES or a custom value
  date: string;      // YYYY-MM-DD (maps to milestone_date)
  isPriority: boolean;
  notes?: string;
  sortOrder: number;
}

/** @deprecated Milestones are now user-level; use Milestone. Alias kept for transition. */
export type PeriodMilestone = Milestone;

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

export type ExerciseCategory = 'cardio' | 'resistance' | 'sports' | 'flexibility' | 'other';

export const EXERCISE_CATEGORIES: ExerciseCategory[] = ['cardio', 'resistance', 'sports', 'flexibility', 'other'];

export const EXERCISE_CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  cardio: 'Cardio',
  resistance: 'Resistance',
  sports: 'Sports',
  flexibility: 'Flexibility',
  other: 'Other',
};

export interface ExerciseLog {
  id: string;
  userId: string;
  date: Date;
  type: ExerciseCategory;
  activityName?: string;
  minutes: number;
  intensity: 'low' | 'medium' | 'high';
  steps?: number;
  distance?: number;
  caloriesBurned?: number;
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
  fiberGrams?: number;
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

// A reusable meal preset ("favorite") that prefills the meal log form
export interface SavedMeal {
  id: string;
  userId: string;
  name: string;
  description?: string;
  mealSlot?: string;
  proteinGrams?: number;
  carbsGrams?: number;
  fatGrams?: number;
  fiberGrams?: number;
  sodiumMg?: number;
  calories?: number;
  antiInflammatory: boolean;
  timesUsed: number;
  lastUsedAt?: Date;
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

export interface JournalEntry {
  id: string;
  userId: string;
  entryDate: string; // YYYY-MM-DD — the day the entry is about
  entryTime?: string; // HH:MM:SS optional time-of-day
  title?: string;
  body: string;
  tags: string[];
  painLevel?: number; // 1-10
  mood?: number; // 1-5
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// Post-surgical daily tracking (period-free)
// ============================================================

// Per-user configurable "+1" tally tracker (water, ostomy empties, etc.)
export interface EventType {
  id: string;
  userId: string;
  key: string;            // stable slug, e.g. 'water'
  label: string;          // display name
  icon?: string;          // lucide icon name or emoji
  unit?: string;          // 'oz','ml','glass'... undefined = plain count
  defaultQuantity: number;
  dailyTarget?: number;   // undefined = no target
  color?: string;
  sortOrder: number;
  isActive: boolean;
}

// A single logged tally event
export interface TrackedEvent {
  id: string;
  userId: string;
  eventTypeId?: string;   // null once the type is deleted; eventKey persists
  eventKey: string;
  occurredAt: Date;
  quantity: number;
  unit?: string;
  notes?: string;
}

export interface Vitals {
  id: string;
  userId: string;
  measuredAt: Date;
  systolic?: number;
  diastolic?: number;
  pulse?: number;
  oxygenSaturation?: number;
  temperature?: number;
  temperatureUnit: 'F' | 'C';
  respiratoryRate?: number;
  bloodGlucose?: number;
  notes?: string;
}

// Time-of-day dose slots (mirrors the AM/NOON/PM/BED columns on the med sheet).
export const MED_SLOTS = [
  { value: 'am', label: 'Morning' },
  { value: 'noon', label: 'Noon' },
  { value: 'pm', label: 'Evening' },
  { value: 'bed', label: 'Bedtime' },
] as const;
export type MedSlot = 'am' | 'noon' | 'pm' | 'bed' | 'prn';

export function medSlotLabel(slot: string): string {
  if (slot === 'prn') return 'As needed';
  return MED_SLOTS.find((s) => s.value === slot)?.label ?? slot;
}

export interface Medication {
  id: string;
  userId: string;
  name: string;
  dose?: string;
  schedule?: string;
  timesPerDay?: number;      // legacy; superseded by slots/isPrn
  slots: string[];           // scheduled slots: subset of am/noon/pm/bed
  isPrn: boolean;            // as-needed
  maxPerDay?: number;        // PRN safety cap (doses / 24h)
  minHoursBetween?: number;  // PRN safety spacing
  notes?: string;
  isActive: boolean;
  sortOrder: number;
}

export type MedicationLogStatus = 'taken' | 'skipped';

export interface MedicationLog {
  id: string;
  userId: string;
  medicationId?: string;  // null once the med is deleted; medicationName persists
  medicationName?: string;
  takenAt: Date;
  slot?: string;          // which slot this dose satisfied (am/noon/pm/bed/prn)
  status: MedicationLogStatus;
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
  { id: '1', userId: '1', date: new Date(2023, 0, 1), type: 'cardio', activityName: 'Walking', minutes: 30, intensity: 'medium', steps: 4500, distance: 3.2 },
  { id: '2', userId: '1', date: new Date(2023, 0, 2), type: 'cardio', activityName: 'Running', minutes: 20, intensity: 'high', steps: 3800, distance: 2.8 },
  { id: '3', userId: '1', date: new Date(2023, 0, 3), type: 'cardio', activityName: 'Cycling', minutes: 45, intensity: 'medium', distance: 15 },
  { id: '4', userId: '1', date: new Date(2023, 0, 5), type: 'cardio', activityName: 'Elliptical', minutes: 30, intensity: 'medium', distance: 5 },
  { id: '5', userId: '1', date: new Date(2023, 0, 6), type: 'cardio', activityName: 'Walking', minutes: 40, intensity: 'low', steps: 5200, distance: 3.8 },
  { id: '6', userId: '1', date: new Date(2023, 0, 8), type: 'cardio', activityName: 'Running', minutes: 25, intensity: 'high', steps: 4200, distance: 3.2 },
  { id: '7', userId: '1', date: new Date(2023, 0, 10), type: 'cardio', activityName: 'Cycling', minutes: 50, intensity: 'medium', distance: 18 },
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
