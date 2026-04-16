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
