import { supabase } from "@/lib/supabase";

export interface MealEvaluation {
  proteinEstimate: number;
  carbsEstimate?: number;
  fatEstimate?: number;
  sodiumEstimate?: number;
  caloriesEstimate?: number;
  assessment: string;
}

export interface DashboardFeedback {
  summary: string;
  highlights: string[];
  concerns: string[];
  tip: string;
}

export interface ExerciseAnalysis {
  category: 'cardio' | 'resistance' | 'sports' | 'flexibility' | 'other';
  activityName: string;
  minutes: number;
  intensity: 'low' | 'medium' | 'high';
  caloriesBurned: number;
  assessment: string;
}

export async function analyzeExercise(data: {
  description: string;
  minutesHint?: number;
  avgHeartRate?: number;
}): Promise<ExerciseAnalysis> {
  const { data: result, error } = await supabase.functions.invoke("analyze-exercise", {
    body: {
      description: data.description,
      minutesHint: data.minutesHint,
      avgHeartRate: data.avgHeartRate,
    },
  });

  if (error) throw new Error(error.message);
  if (!result?.success) throw new Error(result?.error || "Exercise analysis failed");

  return {
    category: result.category,
    activityName: result.activityName,
    minutes: result.minutes,
    intensity: result.intensity,
    caloriesBurned: result.caloriesBurned,
    assessment: result.assessment,
  };
}

export async function evaluateMeal(data: {
  proteinSource?: string;
  notes?: string;
  mealSlot?: string;
}): Promise<MealEvaluation> {
  const { data: result, error } = await supabase.functions.invoke("evaluate-meal", {
    body: {
      proteinSource: data.proteinSource,
      notes: data.notes,
      mealSlot: data.mealSlot,
    },
  });

  if (error) throw new Error(error.message);
  if (!result?.success) throw new Error(result?.error || "AI evaluation failed");

  return {
    proteinEstimate: result.proteinEstimate,
    carbsEstimate: result.carbsEstimate,
    fatEstimate: result.fatEstimate,
    sodiumEstimate: result.sodiumEstimate,
    caloriesEstimate: result.caloriesEstimate,
    assessment: result.assessment,
  };
}

export async function getDashboardFeedback(): Promise<DashboardFeedback> {
  const { data: result, error } = await supabase.functions.invoke("ai-dashboard-feedback", {
    body: {},
  });

  if (error) throw new Error(error.message);
  if (!result?.success) throw new Error(result?.error || "AI feedback failed");

  return {
    summary: result.summary,
    highlights: result.highlights,
    concerns: result.concerns,
    tip: result.tip,
  };
}

export interface DoctorReport {
  report: string; // markdown
  dateFrom: string;
  dateTo: string;
  entryCount: number;
}

export async function generateDoctorReport(params: {
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  focus?: string;
}): Promise<DoctorReport> {
  const { data: result, error } = await supabase.functions.invoke("generate-doctor-report", {
    body: params,
  });
  if (error) throw new Error(error.message);
  if (!result?.success) throw new Error(result?.error || "Failed to generate report");
  return {
    report: result.report,
    dateFrom: result.dateFrom,
    dateTo: result.dateTo,
    entryCount: result.entryCount,
  };
}

export interface JournalInsights {
  insights: string[];
  asOfDate: string;
  entryCount: number;
  reason?: string;
}

export async function getJournalInsights(): Promise<JournalInsights> {
  const { data: result, error } = await supabase.functions.invoke("ai-journal-insights", {
    body: {},
  });
  if (error) throw new Error(error.message);
  if (!result?.success) throw new Error(result?.error || "Failed to generate insights");
  return {
    insights: result.insights || [],
    asOfDate: result.asOfDate,
    entryCount: result.entryCount,
    reason: result.reason,
  };
}
