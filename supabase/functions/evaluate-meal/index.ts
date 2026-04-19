import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
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

    // Build the meal description
    const mealParts: string[] = [];
    if (mealSlot) mealParts.push(`Meal: ${mealSlot}`);
    if (proteinSource) mealParts.push(`Food/Protein source: ${proteinSource}`);
    if (notes) mealParts.push(`Details: ${notes}`);
    const mealDescription = mealParts.join("\n");

    // Build system prompt with user context
    const systemParts: string[] = [
      "You are a nutrition evaluator for a health tracking app. Your job is to evaluate meals and estimate their nutritional content.",
      "Always respond with valid JSON in this exact format: {\"proteinEstimate\": <number>, \"carbsEstimate\": <number>, \"fatEstimate\": <number>, \"sodiumEstimate\": <number>, \"caloriesEstimate\": <number>, \"assessment\": \"<string>\"}",
      "proteinEstimate, carbsEstimate, fatEstimate: grams of each macronutrient (numbers, no units).",
      "sodiumEstimate: milligrams of sodium (number, no units).",
      "caloriesEstimate: total kilocalories (number, no units).",
      "Use 0 for any value you truly cannot estimate, but give a best-effort number for typical foods.",
      "",
      "LANGUAGE: The user may describe the meal in any language (English, Portuguese, Spanish, etc.). Interpret the meal in the user's language and write the assessment in the same language the user used. Do not translate food names unnecessarily.",
      "",
      "WEIGHT INTERPRETATION: unless the user explicitly says 'dry', 'raw', 'uncooked', 'seca', 'crudo', or 'cru', assume weights refer to COOKED / PREPARED / AS-SERVED weight. Cooked weight for starchy foods is 2-3x the dry weight, with correspondingly lower carbs per gram. Getting this wrong is the most common error — do not commit to a number until you've decided whether the weight is cooked or dry.",
      "",
      "REFERENCE ANCHORS (use these as sanity checks — do not exceed them unless the user explicitly said dry weight):",
      "  - 100g COOKED pasta ≈ 25-31g carbs, ~160 kcal, ~5g protein, <1g fat",
      "  - 100g DRY pasta ≈ 70-75g carbs, ~360 kcal, ~13g protein, ~1.5g fat (yields ~250-300g cooked)",
      "  - 100g COOKED white rice ≈ 28g carbs, ~130 kcal",
      "  - 100g COOKED brown rice ≈ 23g carbs, ~110 kcal",
      "  - 100g DRY rice ≈ 78g carbs, ~360 kcal",
      "  - 1 medium slice bread ≈ 15g carbs, ~80 kcal",
      "  - 100g boiled potato ≈ 17g carbs, ~85 kcal",
      "  - 1 whole large egg ≈ 6g protein, 0.5g carbs, 5g fat, ~70 kcal",
      "  - 100g egg whites ≈ 11g protein, 0.7g carbs, 0.2g fat, ~50 kcal",
      "  - 100g cooked chicken breast ≈ 31g protein, 0g carbs, 3.6g fat, ~165 kcal",
      "  - 100g cooked ground beef (85% lean) ≈ 26g protein, 0g carbs, 17g fat, ~250 kcal",
      "",
      "CONSISTENCY SELF-CHECK before you respond: verify your carb, calorie, protein, and fat numbers are internally consistent with (a) the weight-interpretation assumption you stated and (b) the reference anchors above. If the user gave grams of a starchy food, multiply per-100g values accordingly — do not default to dry-weight figures when you said 'assuming cooked'. If your numbers don't match your stated assumption, recompute before responding.",
      "",
      "In the assessment, briefly state the key assumptions you made (e.g. 'Assuming 100g pasta is cooked weight...', 'Assuming ground beef is ~85% lean...') so the user can correct you by rephrasing if needed.",
      "Then add 1-2 sentences evaluating the meal against the user's goals: good choice? Concerns? Praise?",
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
        model: MODEL_COACH,
        max_tokens: 600,
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
      await logAiUsage(supabase, {
        userId,
        functionName: 'evaluate-meal',
        model: MODEL_COACH,
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
      userId,
      functionName: 'evaluate-meal',
      model: claudeData.model || MODEL_COACH,
      usage: claudeData.usage,
      usedFallbackKey,
    });

    // Parse the JSON response from Claude — strip markdown code fences if present
    let proteinEstimate = 0;
    let carbsEstimate = 0;
    let fatEstimate = 0;
    let sodiumEstimate = 0;
    let caloriesEstimate = 0;
    let assessment = "";
    try {
      const jsonStr = responseText.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
      const parsed = JSON.parse(jsonStr);
      proteinEstimate = typeof parsed.proteinEstimate === "number" ? parsed.proteinEstimate : 0;
      carbsEstimate = typeof parsed.carbsEstimate === "number" ? parsed.carbsEstimate : 0;
      fatEstimate = typeof parsed.fatEstimate === "number" ? parsed.fatEstimate : 0;
      sodiumEstimate = typeof parsed.sodiumEstimate === "number" ? parsed.sodiumEstimate : 0;
      caloriesEstimate = typeof parsed.caloriesEstimate === "number" ? parsed.caloriesEstimate : 0;
      assessment = parsed.assessment || "";
    } catch {
      // If Claude didn't return valid JSON, use the raw text as assessment
      assessment = responseText;
    }

    return new Response(JSON.stringify({
      success: true,
      proteinEstimate,
      carbsEstimate,
      fatEstimate,
      sodiumEstimate,
      caloriesEstimate,
      assessment,
    }), {
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
