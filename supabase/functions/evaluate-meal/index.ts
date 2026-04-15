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

interface EvaluateMealRequest {
  userId: string;
  proteinSource?: string;
  notes?: string;
  mealSlot?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: buildCorsHeaders(req) });
  }

  try {
    // Verify the user is authenticated via their JWT
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

    const { proteinSource, notes, mealSlot }: Omit<EvaluateMealRequest, "userId"> = await req.json();
    const userId = user.id;

    // Fetch user's API key and goals from profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("claude_api_key, ai_prompt, health_goals")
      .eq("id", userId)
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

    // Build the meal description
    const mealParts: string[] = [];
    if (mealSlot) mealParts.push(`Meal: ${mealSlot}`);
    if (proteinSource) mealParts.push(`Food/Protein source: ${proteinSource}`);
    if (notes) mealParts.push(`Details: ${notes}`);
    const mealDescription = mealParts.join("\n");

    // Build system prompt with user context
    const systemParts: string[] = [
      "You are a nutrition evaluator for a health tracking app. Your job is to evaluate meals and estimate protein content.",
      "Always respond with valid JSON in this exact format: {\"proteinEstimate\": <number>, \"assessment\": \"<string>\"}",
      "proteinEstimate should be your best estimate of grams of protein in the described meal (a number, no units).",
      "assessment should be 2-3 sentences evaluating the meal: is it a good choice given the user's goals? Any concerns or praise?",
    ];

    if (profile.health_goals) {
      systemParts.push(`\nUser's health goals: ${profile.health_goals}`);
    }
    if (profile.ai_prompt) {
      systemParts.push(`\nUser's dietary context and instructions: ${profile.ai_prompt}`);
    }

    // Call Claude API
    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        system: systemParts.join("\n"),
        messages: [
          {
            role: "user",
            content: `Evaluate this meal and estimate its protein content:\n\n${mealDescription}`,
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

    // Parse the JSON response from Claude — strip markdown code fences if present
    let proteinEstimate = 0;
    let assessment = "";
    try {
      const jsonStr = responseText.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
      const parsed = JSON.parse(jsonStr);
      proteinEstimate = typeof parsed.proteinEstimate === "number" ? parsed.proteinEstimate : 0;
      assessment = parsed.assessment || "";
    } catch {
      // If Claude didn't return valid JSON, use the raw text as assessment
      assessment = responseText;
    }

    return new Response(JSON.stringify({ success: true, proteinEstimate, assessment }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
    });
  } catch (error: any) {
    console.error("Error in evaluate-meal function:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
    });
  }
};

serve(handler);
