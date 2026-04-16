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

interface AnalyzeExerciseRequest {
  description?: string;
  minutesHint?: number;
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

    const { description, minutesHint }: AnalyzeExerciseRequest = await req.json();
    if (!description || !description.trim()) {
      return new Response(JSON.stringify({ success: false, error: "Describe your workout first." }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
      });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("claude_api_key, ai_prompt, health_goals, current_weight")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ success: false, error: "Could not load profile" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
      });
    }

    const apiKey = (profile.claude_api_key && profile.claude_api_key.trim())
      || (Deno.env.get("CLAUDE_API_KEY_FALLBACK") || "").trim()
      || null;
    if (!apiKey) {
      return new Response(JSON.stringify({ success: false, error: "No Claude API key configured. Add one in Profile > Health > AI Settings." }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
      });
    }

    const systemParts: string[] = [
      "You are an exercise analyst for a health tracking app. The user describes a workout in free text; you extract structured fields.",
      "Always respond with valid JSON in this exact format: {\"category\": <string>, \"activityName\": <string>, \"minutes\": <number>, \"intensity\": <string>, \"caloriesBurned\": <number>, \"assessment\": \"<string>\"}",
      "category must be exactly one of: \"cardio\", \"resistance\", \"sports\", \"flexibility\", \"other\".",
      "activityName: the specific activity as the user named it (e.g. \"Jiu Jitsu\", \"Deadlift session\", \"Trail run\"). Title Case. If the user was vague, pick a short sensible label.",
      "minutes: duration in minutes if mentioned or implied; 0 if truly unknown.",
      "intensity must be exactly one of: \"low\", \"medium\", \"high\". Infer from effort words (chill/easy → low; steady/moderate → medium; hard/intense/max/wrecked → high).",
      "caloriesBurned: estimate using MET values for the activity at the inferred intensity. If the user's weight is available, use it; else assume ~75 kg. Round to the nearest 10. Return 0 if minutes is 0.",
      "assessment: 2-3 sentences. Start with the key assumptions (category choice, intensity inference, weight used). Then add a brief comment on the session — recovery considerations, balance, or a note aligned with the user's goals.",
    ];

    if (profile.current_weight) {
      systemParts.push(`\nUser's current weight: ${profile.current_weight} kg`);
    }
    if (profile.health_goals) {
      systemParts.push(`\nUser's health goals: ${profile.health_goals}`);
    }
    if (profile.ai_prompt) {
      systemParts.push(`\nUser's context and instructions: ${profile.ai_prompt}`);
    }

    const userParts: string[] = [];
    if (minutesHint) userParts.push(`Duration hint: ${minutesHint} minutes`);
    userParts.push(`Workout description: ${description.trim()}`);

    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
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
      return new Response(JSON.stringify({ success: false, error: `Claude API error: ${claudeResponse.status}` }), {
        status: 502,
        headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
      });
    }

    const claudeData = await claudeResponse.json();
    const responseText = claudeData.content?.[0]?.text || "";

    const ALLOWED_CATEGORIES = ["cardio", "resistance", "sports", "flexibility", "other"];
    const ALLOWED_INTENSITIES = ["low", "medium", "high"];
    let category = "other";
    let activityName = "";
    let minutes = 0;
    let intensity: string = "medium";
    let caloriesBurned = 0;
    let assessment = "";
    try {
      const jsonStr = responseText.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
      const parsed = JSON.parse(jsonStr);
      const c = typeof parsed.category === "string" ? parsed.category.toLowerCase() : "other";
      category = ALLOWED_CATEGORIES.includes(c) ? c : "other";
      activityName = typeof parsed.activityName === "string" ? parsed.activityName : "";
      minutes = typeof parsed.minutes === "number" ? Math.max(0, Math.round(parsed.minutes)) : 0;
      const i = typeof parsed.intensity === "string" ? parsed.intensity.toLowerCase() : "medium";
      intensity = ALLOWED_INTENSITIES.includes(i) ? i : "medium";
      caloriesBurned = typeof parsed.caloriesBurned === "number" ? Math.max(0, Math.round(parsed.caloriesBurned)) : 0;
      assessment = typeof parsed.assessment === "string" ? parsed.assessment : "";
    } catch {
      assessment = responseText;
    }

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
