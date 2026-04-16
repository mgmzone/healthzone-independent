// Shared AI feedback logic used by ai-dashboard-feedback and send-weekly-summary.
// Keeps prompt + data summary in one place so the dashboard card and the
// weekly email produce consistent coaching output.

export interface AIProfile {
  claude_api_key: string | null;
  ai_prompt: string | null;
  health_goals: string | null;
  target_weight?: number | null;
  current_weight?: number | null;
  protein_target_min?: number | null;
  protein_target_max?: number | null;
}

const DEFAULT_PROTEIN_MIN = 130;
const DEFAULT_PROTEIN_MAX = 150;

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
      .select("date, meal_slot, protein_grams, carbs_grams, fat_grams, sodium_mg, calories, protein_source, anti_inflammatory, irritant_violation, irritant_notes, notes, ai_assessment")
      .eq("user_id", userId).gte("date", dateStr).order("date", { ascending: false }),
    supabase.from("weigh_ins")
      .select("date, weight")
      .eq("user_id", userId).gte("date", dateStr).order("date", { ascending: false }),
    supabase.from("exercise_logs")
      .select("date, type, activity_name, minutes, intensity, calories_burned, distance")
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

  const proteinMin = profile.protein_target_min ?? DEFAULT_PROTEIN_MIN;
  const proteinMax = profile.protein_target_max ?? DEFAULT_PROTEIN_MAX;

  const totalProtein = data.meals.reduce((sum: number, m: any) => sum + (m.protein_grams || 0), 0);
  const totalCarbs = data.meals.reduce((sum: number, m: any) => sum + (m.carbs_grams || 0), 0);
  const totalFat = data.meals.reduce((sum: number, m: any) => sum + (m.fat_grams || 0), 0);
  const totalSodium = data.meals.reduce((sum: number, m: any) => sum + (m.sodium_mg || 0), 0);
  const totalCalories = data.meals.reduce((sum: number, m: any) => sum + (m.calories || 0), 0);
  const hasMacroData = totalCarbs > 0 || totalFat > 0 || totalCalories > 0;

  const daysWithMeals = new Set(data.meals.map((m: any) => m.date)).size;
  const avgDailyProtein = daysWithMeals > 0 ? Math.round(totalProtein / daysWithMeals) : 0;
  const avgDailyCarbs = daysWithMeals > 0 ? Math.round(totalCarbs / daysWithMeals) : 0;
  const avgDailyFat = daysWithMeals > 0 ? Math.round(totalFat / daysWithMeals) : 0;
  const avgDailySodium = daysWithMeals > 0 ? Math.round(totalSodium / daysWithMeals) : 0;
  const avgDailyCalories = daysWithMeals > 0 ? Math.round(totalCalories / daysWithMeals) : 0;
  const irritantCount = data.meals.filter((m: any) => m.irritant_violation).length;
  const antiInflamCount = data.meals.filter((m: any) => m.anti_inflammatory).length;
  const macroLine = hasMacroData
    ? ` Average daily carbs: ${avgDailyCarbs}g, fat: ${avgDailyFat}g, sodium: ${avgDailySodium}mg, calories: ${avgDailyCalories}.`
    : "";
  parts.push(`MEALS (last 7 days): ${data.meals.length} meals over ${daysWithMeals} days. Average daily protein: ${avgDailyProtein}g. Target: ${proteinMin}-${proteinMax}g/day.${macroLine} Anti-inflammatory meals: ${antiInflamCount}. Irritant violations: ${irritantCount}.`);

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
    const totalCalories = data.exercises.reduce((sum: number, e: any) => sum + (e.calories_burned || 0), 0);

    const byCategory = new Map<string, { count: number; minutes: number; calories: number; names: Set<string> }>();
    for (const e of data.exercises) {
      const cat = e.type || 'other';
      const bucket = byCategory.get(cat) || { count: 0, minutes: 0, calories: 0, names: new Set<string>() };
      bucket.count += 1;
      bucket.minutes += e.minutes || 0;
      bucket.calories += e.calories_burned || 0;
      if (e.activity_name) bucket.names.add(e.activity_name);
      byCategory.set(cat, bucket);
    }
    const categoryLines = Array.from(byCategory.entries())
      .sort((a, b) => b[1].minutes - a[1].minutes)
      .map(([cat, b]) => {
        const names = b.names.size > 0 ? ` (${Array.from(b.names).slice(0, 3).join(', ')})` : '';
        const cals = b.calories > 0 ? `, ~${b.calories} kcal` : '';
        return `  ${cat}: ${b.count} session${b.count === 1 ? '' : 's'}, ${b.minutes} min${cals}${names}`;
      })
      .join("\n");
    const caloriesLine = totalCalories > 0 ? `, ~${totalCalories} kcal burned` : "";
    parts.push(`EXERCISE: ${data.exercises.length} sessions, ${totalMinutes} total minutes${caloriesLine}.\nBy category:\n${categoryLines}`);
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
