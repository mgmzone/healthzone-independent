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
}): Promise<ExerciseAnalysis> {
  const { data: result, error } = await supabase.functions.invoke("analyze-exercise", {
    body: {
      description: data.description,
      minutesHint: data.minutesHint,
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
