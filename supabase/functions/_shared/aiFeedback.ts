// Shared AI feedback logic used by ai-dashboard-feedback and send-weekly-summary.
// Keeps prompt + data summary in one place so the dashboard card and the
// weekly email produce consistent coaching output.

export interface AIProfile {
  claude_api_key: string | null;
  ai_prompt: string | null;
  health_goals: string | null;
  target_weight?: number | null;
  current_weight?: number | null;
}

export interface WeeklyData {
  meals: any[];
  weighIns: any[];
  exercises: any[];
  fasting: any[];
  goalEntries: any[];
}

export interface AIFeedback {
  summary: string;
  highlights: string[];
  concerns: string[];
  tip: string;
}

export const EMPTY_FEEDBACK: AIFeedback = { summary: "", highlights: [], concerns: [], tip: "" };

export function resolveClaudeApiKey(profileKey: string | null | undefined, fallback: string | null | undefined): string | null {
  return (profileKey && profileKey.trim()) || (fallback && fallback.trim()) || null;
}

export async function fetchWeeklyData(supabase: any, userId: string, daysBack = 7): Promise<WeeklyData> {
  const since = new Date();
  since.setDate(since.getDate() - daysBack);
  const dateStr = since.toISOString().split("T")[0];

  const [mealsResult, weighInsResult, exerciseResult, fastingResult, goalsResult] = await Promise.all([
    supabase.from("meal_logs")
      .select("date, meal_slot, protein_grams, protein_source, anti_inflammatory, irritant_violation, irritant_notes, notes, ai_assessment")
      .eq("user_id", userId).gte("date", dateStr).order("date", { ascending: false }),
    supabase.from("weigh_ins")
      .select("date, weight")
      .eq("user_id", userId).gte("date", dateStr).order("date", { ascending: false }),
    supabase.from("exercise_logs")
      .select("date, type, minutes, intensity")
      .eq("user_id", userId).gte("created_at", dateStr + "T00:00:00").order("created_at", { ascending: false }),
    supabase.from("fasting_logs")
      .select("start_time, end_time, fasting_hours")
      .eq("user_id", userId).gte("start_time", dateStr + "T00:00:00").order("start_time", { ascending: false }),
    supabase.from("daily_goal_entries")
      .select("date, met, goal_id")
      .eq("user_id", userId).gte("date", dateStr),
  ]);

  return {
    meals: mealsResult.data || [],
    weighIns: weighInsResult.data || [],
    exercises: exerciseResult.data || [],
    fasting: fastingResult.data || [],
    goalEntries: goalsResult.data || [],
  };
}

export function buildDataSummary(data: WeeklyData, profile: AIProfile): string {
  const parts: string[] = [];

  const totalProtein = data.meals.reduce((sum: number, m: any) => sum + (m.protein_grams || 0), 0);
  const daysWithMeals = new Set(data.meals.map((m: any) => m.date)).size;
  const avgDailyProtein = daysWithMeals > 0 ? Math.round(totalProtein / daysWithMeals) : 0;
  const irritantCount = data.meals.filter((m: any) => m.irritant_violation).length;
  const antiInflamCount = data.meals.filter((m: any) => m.anti_inflammatory).length;
  parts.push(`MEALS (last 7 days): ${data.meals.length} meals over ${daysWithMeals} days. Average daily protein: ${avgDailyProtein}g. Target: 130-150g/day. Anti-inflammatory meals: ${antiInflamCount}. Irritant violations: ${irritantCount}.`);

  if (data.meals.length > 0) {
    const mealDetails = data.meals.slice(0, 10).map((m: any) =>
      `  ${m.date} ${m.meal_slot}: ${m.protein_source || 'unknown'} (${m.protein_grams || '?'}g protein)${m.irritant_violation ? ' [IRRITANT: ' + (m.irritant_notes || 'unspecified') + ']' : ''}${m.anti_inflammatory ? ' [anti-inflammatory]' : ''}`
    ).join("\n");
    parts.push(`Recent meals:\n${mealDetails}`);
  }

  if (data.weighIns.length > 0) {
    const latestWeight = data.weighIns[0].weight;
    const earliestWeight = data.weighIns[data.weighIns.length - 1].weight;
    const weightChange = latestWeight - earliestWeight;
    parts.push(`WEIGHT: ${data.weighIns.length} weigh-ins. Latest: ${latestWeight}kg. Change this week: ${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)}kg.${profile.target_weight ? ` Target: ${profile.target_weight}kg.` : ''}`);
  } else {
    parts.push("WEIGHT: No weigh-ins recorded this week.");
  }

  if (data.exercises.length > 0) {
    const totalMinutes = data.exercises.reduce((sum: number, e: any) => sum + (e.minutes || 0), 0);
    parts.push(`EXERCISE: ${data.exercises.length} sessions, ${totalMinutes} total minutes.`);
  } else {
    parts.push("EXERCISE: No exercise logged this week.");
  }

  if (data.fasting.length > 0) {
    const avgFastingHours = data.fasting.reduce((sum: number, f: any) => sum + (f.fasting_hours || 0), 0) / data.fasting.length;
    parts.push(`FASTING: ${data.fasting.length} fasting sessions. Average: ${avgFastingHours.toFixed(1)} hours.`);
  } else {
    parts.push("FASTING: No fasting logged this week.");
  }

  if (data.goalEntries.length > 0) {
    const metCount = data.goalEntries.filter((g: any) => g.met).length;
    const compliance = Math.round((metCount / data.goalEntries.length) * 100);
    parts.push(`DAILY GOALS: ${metCount}/${data.goalEntries.length} goals met (${compliance}% compliance).`);
  }

  return parts.join("\n\n");
}

export function buildSystemPrompt(profile: AIProfile): string {
  const systemParts: string[] = [
    "You are a supportive health coach AI reviewing a user's weekly health data. Be encouraging but honest.",
    'Respond with valid JSON in this exact format: {"summary": "<2-3 sentence overall assessment>", "highlights": ["<good thing 1>", "<good thing 2>"], "concerns": ["<concern 1>"], "tip": "<one specific, actionable tip for next week>"}',
    "Keep highlights and concerns to 1-3 items each. Be specific, not generic.",
  ];
  if (profile.health_goals) systemParts.push(`\nUser's health goals: ${profile.health_goals}`);
  if (profile.ai_prompt) systemParts.push(`\nUser's dietary context: ${profile.ai_prompt}`);
  return systemParts.join("\n");
}

export async function callClaudeForFeedback(apiKey: string, profile: AIProfile, dataSummary: string): Promise<AIFeedback> {
  const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      system: buildSystemPrompt(profile),
      messages: [{
        role: "user",
        content: `Here is my health data for the past week. Please evaluate my progress:\n\n${dataSummary}`,
      }],
    }),
  });

  if (!claudeResponse.ok) {
    const errorBody = await claudeResponse.text();
    console.error("Claude API error:", claudeResponse.status, errorBody);
    throw new Error(`Claude API error: ${claudeResponse.status}`);
  }

  const claudeData = await claudeResponse.json();
  const responseText = claudeData.content?.[0]?.text || "";

  try {
    const jsonStr = responseText.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
    const parsed = JSON.parse(jsonStr);
    return {
      summary: parsed.summary || "",
      highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
      concerns: Array.isArray(parsed.concerns) ? parsed.concerns : [],
      tip: parsed.tip || "",
    };
  } catch {
    return { summary: responseText, highlights: [], concerns: [], tip: "" };
  }
}
