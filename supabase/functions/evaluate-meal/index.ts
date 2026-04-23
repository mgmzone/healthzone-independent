import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { checkFallbackDailyCap, logAiUsage } from "../_shared/aiUsage.ts";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { MODEL_COACH } from "../_shared/models.ts";
import { extractJson } from "../_shared/parseJson.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

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

    if (usedFallbackKey) {
      const cap = await checkFallbackDailyCap(supabase, userId);
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

    // Build the meal description
    const mealParts: string[] = [];
    if (mealSlot) mealParts.push(`Meal: ${mealSlot}`);
    if (proteinSource) mealParts.push(`Food/Protein source: ${proteinSource}`);
    if (notes) mealParts.push(`Details: ${notes}`);
    const mealDescription = mealParts.join("\n");

    // Build system prompt with user context
    const systemParts: string[] = [
      "You are a nutrition evaluator for a health tracking app. Your job is to evaluate meals and estimate their nutritional content.",
      "Always respond with valid JSON in this exact format: {\"breakdown\": [{\"item\": \"<string>\", \"grams\": <number>, \"protein\": <number>, \"carbs\": <number>, \"fat\": <number>, \"sodium\": <number>, \"calories\": <number>}, ...], \"assessment\": \"<string>\"}",
      "breakdown: an array with one entry per food item in the meal. Each entry's macros are for THAT item's portion (not per 100g).",
      "  - item: short label in the user's language (e.g. 'pão de forma', 'cooked chicken breast').",
      "  - grams: the portion size in grams. If the user gave a non-gram unit (slice, cup, egg), convert to approximate grams.",
      "  - protein, carbs, fat: grams for this portion (numbers, no units).",
      "  - sodium: milligrams for this portion (number, no units).",
      "  - calories: total kilocalories for this portion (number, no units).",
      "Use 0 for any field you truly cannot estimate, but give a best-effort number for typical foods.",
      "The server sums the breakdown to get meal totals — you do not need to output totals separately. Getting the per-item numbers right IS the job.",
      "",
      "LANGUAGE: The user may describe the meal in any language (English, Portuguese, Spanish, etc.). Interpret the meal in the user's language and write the assessment in the same language the user used. Do not translate food names unnecessarily.",
      "",
      "WEIGHT INTERPRETATION: unless the user explicitly says 'dry', 'raw', 'uncooked', 'seca', 'crudo', or 'cru', assume weights refer to COOKED / PREPARED / AS-SERVED weight. Cooked weight for starchy foods is 2-3x the dry weight, with correspondingly lower carbs per gram. Getting this wrong is the most common error — do not commit to a number until you've decided whether the weight is cooked or dry.",
      "",
      "REFERENCE ANCHORS (per 100g unless noted — scale to the item's actual grams in the breakdown):",
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
      "  - 100g standard mozzarella ≈ 22g protein, 2g carbs, 22g fat, ~280 kcal",
      "",
      "For each breakdown item: multiply the per-100g reference by (grams / 100). Do not copy per-100g figures directly into the breakdown unless the portion actually is 100g.",
      "",
      "In the assessment, briefly state the key assumptions you made (e.g. 'Assuming 100g pasta is cooked weight...', 'Assuming ground beef is ~85% lean...') so the user can correct you by rephrasing if needed.",
      "Then add 1-2 sentences evaluating the meal against the user's goals: good choice? Concerns? Praise?",
      "Do NOT restate the meal totals in the assessment — the UI renders them separately from the summed breakdown. If you mention per-item numbers in the assessment, they MUST match the breakdown.",
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

    // Extract the JSON object from Claude's response — handles code fences
    // and prose wrappers both. Returns null if no parseable JSON found.
    const parsed = extractJson<{
      breakdown?: Array<{
        item?: string;
        grams?: number;
        protein?: number;
        carbs?: number;
        fat?: number;
        sodium?: number;
        calories?: number;
      }>;
      assessment?: string;
    }>(responseText);

    // Sum the per-item breakdown to get meal totals. This is deliberately the
    // only source of truth for macros — Claude used to emit top-level totals
    // that disagreed with its own breakdown (e.g. breakdown summed to 27.5g
    // protein but proteinEstimate said 22). Summing server-side makes the
    // arithmetic deterministic.
    const breakdown = Array.isArray(parsed?.breakdown) ? parsed.breakdown : [];
    const sumField = (key: "protein" | "carbs" | "fat" | "sodium" | "calories") =>
      breakdown.reduce((acc, item) => acc + (typeof item?.[key] === "number" ? item[key]! : 0), 0);
    const round1 = (n: number) => Math.round(n * 10) / 10;

    const proteinEstimate = round1(sumField("protein"));
    const carbsEstimate = round1(sumField("carbs"));
    const fatEstimate = round1(sumField("fat"));
    const sodiumEstimate = Math.round(sumField("sodium"));
    const caloriesEstimate = Math.round(sumField("calories"));
    const assessment = parsed?.assessment || (parsed ? "" : responseText);

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
