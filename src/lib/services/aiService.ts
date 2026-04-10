import { supabase } from "@/lib/supabase";

export interface MealEvaluation {
  proteinEstimate: number;
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
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const { data: result, error } = await supabase.functions.invoke("evaluate-meal", {
    body: {
      userId: session.user.id,
      proteinSource: data.proteinSource,
      notes: data.notes,
      mealSlot: data.mealSlot,
    },
  });

  if (error) throw new Error(error.message);
  if (!result?.success) throw new Error(result?.error || "AI evaluation failed");

  return {
    proteinEstimate: result.proteinEstimate,
    assessment: result.assessment,
  };
}

export async function getDashboardFeedback(): Promise<DashboardFeedback> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const { data: result, error } = await supabase.functions.invoke("ai-dashboard-feedback", {
    body: { userId: session.user.id },
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
