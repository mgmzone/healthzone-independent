import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import {
  buildDataSummary,
  callClaudeForFeedback,
  fetchWeeklyData,
  resolveClaudeApiKey,
} from "../_shared/aiFeedback.ts";
import { logAiUsage } from "../_shared/aiUsage.ts";
import { MODEL_COACH } from "../_shared/models.ts";

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

    const userId = user.id;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("claude_api_key, ai_prompt, health_goals, target_meals_per_day, target_weight, current_weight, protein_target_min, protein_target_max")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ success: false, error: "Could not load profile" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
      });
    }

    const userKey = (profile.claude_api_key && profile.claude_api_key.trim()) || "";
    const fallbackKey = (Deno.env.get("CLAUDE_API_KEY_FALLBACK") || "").trim();
    const apiKey = resolveClaudeApiKey(profile.claude_api_key, Deno.env.get("CLAUDE_API_KEY_FALLBACK"));
    const usedFallbackKey = !userKey && !!fallbackKey;
    if (!apiKey) {
      return new Response(JSON.stringify({ success: false, error: "No Claude API key configured" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
      });
    }

    const weeklyData = await fetchWeeklyData(supabase, userId, 7);
    const dataSummary = buildDataSummary(weeklyData, profile);

    try {
      const { feedback, model, usage } = await callClaudeForFeedback(apiKey, profile, dataSummary);
      await logAiUsage(supabase, {
        userId,
        functionName: 'ai-dashboard-feedback',
        model,
        usage,
        usedFallbackKey,
      });
      return new Response(JSON.stringify({ success: true, ...feedback }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
      });
    } catch (err: any) {
      await logAiUsage(supabase, {
        userId,
        functionName: 'ai-dashboard-feedback',
        model: MODEL_COACH,
        usedFallbackKey,
        status: 'error',
        error: err.message || 'Claude API error',
      });
      return new Response(JSON.stringify({ success: false, error: err.message || "Claude API error" }), {
        status: 502,
        headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
      });
    }
  } catch (error: any) {
    console.error("Error in ai-dashboard-feedback function:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
    });
  }
};

serve(handler);
