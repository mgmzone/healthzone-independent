import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { checkFallbackDailyCap, logAiUsage } from "../_shared/aiUsage.ts";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { MODEL_BASIC } from "../_shared/models.ts";
import { extractJson } from "../_shared/parseJson.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

interface AnalyzeExerciseRequest {
  description?: string;
  minutesHint?: number;
  avgHeartRate?: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: buildCorsHeaders(req) });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
      });
    }

    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ success: false, error: "Invalid or expired session" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
      });
    }

    const { description, minutesHint, avgHeartRate }: AnalyzeExerciseRequest = await req.json();
    if (!description || !description.trim()) {
      return new Response(JSON.stringify({ success: false, error: "Describe your workout first." }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
      });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("claude_api_key, ai_prompt, health_goals, current_weight, birth_date, gender, fitness_level")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ success: false, error: "Could not load profile" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
      });
    }

    const userKey = (profile.claude_api_key && profile.claude_api_key.trim()) || "";
    const fallbackKey = (Deno.env.get("CLAUDE_API_KEY_FALLBACK") || "").trim();
    const apiKey = userKey || fallbackKey || null;
    const usedFallbackKey = !userKey && !!fallbackKey;
    if (!apiKey) {
      return new Response(JSON.stringify({ success: false, error: "No Claude API key configured. Add one in Profile > Health > AI Settings." }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
      });
    }

    if (usedFallbackKey) {
      const cap = await checkFallbackDailyCap(supabase, user.id);
      if (cap.capped) {
        return new Response(JSON.stringify({
          success: false,
          error: `Daily AI usage limit reached ($${cap.spentUsd.toFixed(2)} of $${cap.capUsd.toFixed(2)}). Add your own Claude API key in Profile > Health > AI Settings to continue.`,
        }), {
          status: 429,
          headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
        });
      }
    }

    // Derive age from birth_date so Claude can scale MET and compute max HR
    let ageYears: number | null = null;
    if (profile.birth_date) {
      const birth = new Date(profile.birth_date);
      if (!isNaN(birth.getTime())) {
        const diffMs = Date.now() - birth.getTime();
        ageYears = Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000));
      }
    }

    const systemParts: string[] = [
      "You are an exercise analyst for a health tracking app. The user describes a workout in free text; you extract structured fields.",
      "Always respond with valid JSON in this exact format: {\"category\": <string>, \"activityName\": <string>, \"minutes\": <number>, \"intensity\": <string>, \"caloriesBurned\": <number>, \"assessment\": \"<string>\"}",
      "category must be exactly one of: \"cardio\", \"resistance\", \"sports\", \"flexibility\", \"other\".",
      "activityName: the specific activity as the user named it (e.g. \"Jiu Jitsu\", \"Deadlift session\", \"Trail run\"). Title Case. If the user was vague, pick a short sensible label.",
      "minutes: duration in minutes if mentioned or implied; 0 if truly unknown.",
      "intensity must be exactly one of: \"low\", \"medium\", \"high\". Infer from effort words, calibrated by the user's fitness level (\"hard\" for a sedentary user ≈ \"moderate\" for an active one).",
      "caloriesBurned estimation rules:",
      "  - Preferred: if avgHeartRate is provided AND age, weight, and gender are known, use the Keytel formula.",
      "    Men:   kcal/min = ((age × 0.2017) − (weight_kg × 0.09036) + (HR × 0.6309) − 55.0969) / 4.184",
      "    Women: kcal/min = ((age × 0.074)  − (weight_kg × 0.05741) + (HR × 0.4472) − 20.4022) / 4.184",
      "    Multiply by minutes; clamp to >= 0.",
      "  - Fallback: MET × weight_kg × (minutes / 60). Scale MET by intensity. If weight unknown, use 75 kg.",
      "  - Adjust final estimate ±5-10% for gender (men typically burn ~10% more at same weight/HR) and fitness level (trained athletes are slightly more efficient at the same effort).",
      "  - Round to the nearest 10. Return 0 if minutes is 0.",
      "assessment: 2-3 sentences. Start with the key assumptions (category, intensity, which formula you used and inputs). Then a brief comment on the session against the user's goals — recovery, intensity balance, or alignment.",
    ];

    const userContext: string[] = [];
    if (profile.current_weight) userContext.push(`Current weight: ${profile.current_weight} kg`);
    if (ageYears !== null) userContext.push(`Age: ${ageYears} years`);
    if (profile.gender) userContext.push(`Gender: ${profile.gender}`);
    if (profile.fitness_level) userContext.push(`Fitness level: ${profile.fitness_level}`);
    if (ageYears !== null) userContext.push(`Estimated max HR (220 - age): ${220 - ageYears} bpm`);
    if (userContext.length > 0) {
      systemParts.push(`\nUser profile:\n${userContext.map(l => `  - ${l}`).join("\n")}`);
    }
    if (profile.health_goals) {
      systemParts.push(`\nUser's health goals: ${profile.health_goals}`);
    }
    if (profile.ai_prompt) {
      systemParts.push(`\nUser's context and instructions: ${profile.ai_prompt}`);
    }

    const userParts: string[] = [];
    if (minutesHint) userParts.push(`Duration hint: ${minutesHint} minutes`);
    if (avgHeartRate && avgHeartRate > 0) userParts.push(`Average heart rate: ${avgHeartRate} bpm`);
    userParts.push(`Workout description: ${description.trim()}`);

    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL_BASIC,
        max_tokens: 400,
        system: systemParts.join("\n"),
        messages: [
          { role: "user", content: userParts.join("\n\n") },
        ],
      }),
    });

    if (!claudeResponse.ok) {
      const errorBody = await claudeResponse.text();
      console.error("Claude API error:", claudeResponse.status, errorBody);
      await logAiUsage(supabase, {
        userId: user.id,
        functionName: 'analyze-exercise',
        model: MODEL_BASIC,
        usedFallbackKey,
        status: 'error',
        error: `Claude API ${claudeResponse.status}`,
      });
      return new Response(JSON.stringify({ success: false, error: `Claude API error: ${claudeResponse.status}` }), {
        status: 502,
        headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
      });
    }

    const claudeData = await claudeResponse.json();
    const responseText = claudeData.content?.[0]?.text || "";
    await logAiUsage(supabase, {
      userId: user.id,
      functionName: 'analyze-exercise',
      model: claudeData.model || MODEL_BASIC,
      usage: claudeData.usage,
      usedFallbackKey,
    });

    const ALLOWED_CATEGORIES = ["cardio", "resistance", "sports", "flexibility", "other"];
    const ALLOWED_INTENSITIES = ["low", "medium", "high"];
    const parsed = extractJson<{
      category?: string;
      activityName?: string;
      minutes?: number;
      intensity?: string;
      caloriesBurned?: number;
      assessment?: string;
    }>(responseText);

    const c = typeof parsed?.category === "string" ? parsed.category.toLowerCase() : "other";
    const category = ALLOWED_CATEGORIES.includes(c) ? c : "other";
    const activityName = typeof parsed?.activityName === "string" ? parsed.activityName : "";
    const minutes = typeof parsed?.minutes === "number" ? Math.max(0, Math.round(parsed.minutes)) : 0;
    const i = typeof parsed?.intensity === "string" ? parsed.intensity.toLowerCase() : "medium";
    const intensity = ALLOWED_INTENSITIES.includes(i) ? i : "medium";
    const caloriesBurned = typeof parsed?.caloriesBurned === "number" ? Math.max(0, Math.round(parsed.caloriesBurned)) : 0;
    const assessment = typeof parsed?.assessment === "string" ? parsed.assessment : (parsed ? "" : responseText);

    return new Response(JSON.stringify({
      success: true,
      category,
      activityName,
      minutes,
      intensity,
      caloriesBurned,
      assessment,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
    });
  } catch (error: any) {
    console.error("Error in analyze-exercise function:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
    });
  }
};

serve(handler);
