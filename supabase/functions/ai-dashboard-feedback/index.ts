import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

function buildCorsHeaders(req: Request) {
  const allowed = (Deno.env.get("ALLOWED_ORIGIN") || "http://localhost:8080,http://localhost:5173,http://localhost:8081").split(",").map(s => s.trim());
  const reqOrigin = req.headers.get("Origin") || "";
  const originToUse = allowed.includes(reqOrigin) ? reqOrigin : allowed[0] || "*";
  return {
    "Access-Control-Allow-Origin": originToUse,
    "Vary": "Origin",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  } as Record<string, string>;
}

interface DashboardFeedbackRequest {
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: buildCorsHeaders(req) });
  }

  try {
    const { userId }: DashboardFeedbackRequest = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ success: false, error: "userId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
      });
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("claude_api_key, ai_prompt, health_goals, target_meals_per_day, target_weight, current_weight")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ success: false, error: "Could not load profile" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
      });
    }

    if (!profile.claude_api_key) {
      return new Response(JSON.stringify({ success: false, error: "No Claude API key configured" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
      });
    }

    // Fetch last 7 days of data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateStr = sevenDaysAgo.toISOString().split("T")[0];

    const [mealsResult, weighInsResult, exerciseResult, fastingResult, goalsResult] = await Promise.all([
      supabase.from("meal_logs").select("date, meal_slot, protein_grams, protein_source, anti_inflammatory, irritant_violation, irritant_notes, notes, ai_assessment").eq("user_id", userId).gte("date", dateStr).order("date", { ascending: false }),
      supabase.from("weigh_ins").select("date, weight").eq("user_id", userId).gte("date", dateStr).order("date", { ascending: false }),
      supabase.from("exercise_logs").select("date, type, minutes, intensity").eq("user_id", userId).gte("created_at", dateStr + "T00:00:00").order("created_at", { ascending: false }),
      supabase.from("fasting_logs").select("start_time, end_time, fasting_hours").eq("user_id", userId).gte("start_time", dateStr + "T00:00:00").order("start_time", { ascending: false }),
      supabase.from("daily_goal_entries").select("date, met, goal_id").eq("user_id", userId).gte("date", dateStr),
    ]);

    // Build data summary for Claude
    const meals = mealsResult.data || [];
    const weighIns = weighInsResult.data || [];
    const exercises = exerciseResult.data || [];
    const fasting = fastingResult.data || [];
    const goalEntries = goalsResult.data || [];

    const dataSummary: string[] = [];

    // Meals summary
    const totalProtein = meals.reduce((sum, m) => sum + (m.protein_grams || 0), 0);
    const daysWithMeals = new Set(meals.map(m => m.date)).size;
    const avgDailyProtein = daysWithMeals > 0 ? Math.round(totalProtein / daysWithMeals) : 0;
    const irritantCount = meals.filter(m => m.irritant_violation).length;
    const antiInflamCount = meals.filter(m => m.anti_inflammatory).length;
    dataSummary.push(`MEALS (last 7 days): ${meals.length} meals over ${daysWithMeals} days. Average daily protein: ${avgDailyProtein}g. Target: 130-150g/day. Anti-inflammatory meals: ${antiInflamCount}. Irritant violations: ${irritantCount}.`);

    if (meals.length > 0) {
      const mealDetails = meals.slice(0, 10).map(m =>
        `  ${m.date} ${m.meal_slot}: ${m.protein_source || 'unknown'} (${m.protein_grams || '?'}g protein)${m.irritant_violation ? ' [IRRITANT: ' + (m.irritant_notes || 'unspecified') + ']' : ''}${m.anti_inflammatory ? ' [anti-inflammatory]' : ''}`
      ).join("\n");
      dataSummary.push(`Recent meals:\n${mealDetails}`);
    }

    // Weight summary
    if (weighIns.length > 0) {
      const latestWeight = weighIns[0].weight;
      const earliestWeight = weighIns[weighIns.length - 1].weight;
      const weightChange = latestWeight - earliestWeight;
      dataSummary.push(`WEIGHT: ${weighIns.length} weigh-ins. Latest: ${latestWeight}kg. Change this week: ${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)}kg.${profile.target_weight ? ` Target: ${profile.target_weight}kg.` : ''}`);
    } else {
      dataSummary.push("WEIGHT: No weigh-ins recorded this week.");
    }

    // Exercise summary
    if (exercises.length > 0) {
      const totalMinutes = exercises.reduce((sum, e) => sum + (e.minutes || 0), 0);
      dataSummary.push(`EXERCISE: ${exercises.length} sessions, ${totalMinutes} total minutes.`);
    } else {
      dataSummary.push("EXERCISE: No exercise logged this week.");
    }

    // Fasting summary
    if (fasting.length > 0) {
      const avgFastingHours = fasting.reduce((sum, f) => sum + (f.fasting_hours || 0), 0) / fasting.length;
      dataSummary.push(`FASTING: ${fasting.length} fasting sessions. Average: ${avgFastingHours.toFixed(1)} hours.`);
    } else {
      dataSummary.push("FASTING: No fasting logged this week.");
    }

    // Daily goals summary
    if (goalEntries.length > 0) {
      const metCount = goalEntries.filter(g => g.met).length;
      const compliance = Math.round((metCount / goalEntries.length) * 100);
      dataSummary.push(`DAILY GOALS: ${metCount}/${goalEntries.length} goals met (${compliance}% compliance).`);
    }

    // Build system prompt
    const systemParts: string[] = [
      "You are a supportive health coach AI reviewing a user's weekly health data. Be encouraging but honest.",
      'Respond with valid JSON in this exact format: {"summary": "<2-3 sentence overall assessment>", "highlights": ["<good thing 1>", "<good thing 2>"], "concerns": ["<concern 1>"], "tip": "<one specific, actionable tip for next week>"}',
      "Keep highlights and concerns to 1-3 items each. Be specific, not generic.",
    ];

    if (profile.health_goals) {
      systemParts.push(`\nUser's health goals: ${profile.health_goals}`);
    }
    if (profile.ai_prompt) {
      systemParts.push(`\nUser's dietary context: ${profile.ai_prompt}`);
    }

    // Call Claude API
    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": profile.claude_api_key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        system: systemParts.join("\n"),
        messages: [
          {
            role: "user",
            content: `Here is my health data for the past week. Please evaluate my progress:\n\n${dataSummary.join("\n\n")}`,
          },
        ],
      }),
    });

    if (!claudeResponse.ok) {
      const errorBody = await claudeResponse.text();
      console.error("Claude API error:", claudeResponse.status, errorBody);
      return new Response(JSON.stringify({ success: false, error: `Claude API error: ${claudeResponse.status}` }), {
        status: 502,
        headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
      });
    }

    const claudeData = await claudeResponse.json();
    const responseText = claudeData.content?.[0]?.text || "";

    // Parse response — strip markdown code fences if present
    let result = { summary: "", highlights: [] as string[], concerns: [] as string[], tip: "" };
    try {
      const jsonStr = responseText.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
      const parsed = JSON.parse(jsonStr);
      result.summary = parsed.summary || "";
      result.highlights = Array.isArray(parsed.highlights) ? parsed.highlights : [];
      result.concerns = Array.isArray(parsed.concerns) ? parsed.concerns : [];
      result.tip = parsed.tip || "";
    } catch {
      result.summary = responseText;
    }

    return new Response(JSON.stringify({ success: true, ...result }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
    });
  } catch (error: any) {
    console.error("Error in ai-dashboard-feedback function:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
    });
  }
};

serve(handler);
