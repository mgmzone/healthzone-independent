import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { checkFallbackDailyCap, logAiUsage } from "../_shared/aiUsage.ts";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { MODEL_COACH } from "../_shared/models.ts";
import { extractJson } from "../_shared/parseJson.ts";

// Scans the user's last 14 days of journal entries + tracking data and
// surfaces 2-3 non-obvious patterns. Meant to be displayed on the Journal
// page as a small card the user can refresh. Cheap to call but sessionStorage
// caching in the frontend makes every refresh free after the first run.

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const LOOKBACK_DAYS = 14;
const MIN_ENTRIES_FOR_INSIGHTS = 3;

interface InsightsResponse {
  insights: string[];
  asOfDate: string;
  entryCount: number;
  reason?: string;
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

    const { data: profile } = await supabase
      .from("profiles")
      .select("claude_api_key, ai_prompt, health_goals, time_zone")
      .eq("id", user.id)
      .single();

    const userKey = (profile?.claude_api_key && profile.claude_api_key.trim()) || "";
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
          error: `Daily AI usage limit reached ($${cap.spentUsd.toFixed(2)} of $${cap.capUsd.toFixed(2)}).`,
        }), {
          status: 429,
          headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
        });
      }
    }

    const dateFrom = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const asOfDate = new Date().toISOString().slice(0, 10);

    // Pull journal + companion data in parallel so Claude can correlate them.
    const [journalResp, mealsResp, fastsResp, exerciseResp, weighInsResp] = await Promise.all([
      supabase
        .from("journal_entries")
        .select("entry_date, entry_time, title, body, tags, pain_level, mood")
        .eq("user_id", user.id)
        .gte("entry_date", dateFrom)
        .order("entry_date", { ascending: true }),
      supabase
        .from("meal_logs")
        .select("date, meal_slot, protein_grams, irritant_violation, anti_inflammatory")
        .eq("user_id", user.id)
        .gte("date", dateFrom),
      supabase
        .from("fasting_logs")
        .select("start_time, fasting_hours")
        .eq("user_id", user.id)
        .gte("start_time", `${dateFrom}T00:00:00`),
      supabase
        .from("exercise_logs")
        .select("date, type, minutes, intensity")
        .eq("user_id", user.id)
        .gte("date", dateFrom),
      supabase
        .from("weigh_ins")
        .select("date, weight")
        .eq("user_id", user.id)
        .gte("date", dateFrom)
        .order("date", { ascending: true }),
    ]);

    const journal = journalResp.data || [];

    if (journal.length < MIN_ENTRIES_FOR_INSIGHTS) {
      const resp: InsightsResponse = {
        insights: [],
        asOfDate,
        entryCount: journal.length,
        reason: `Need at least ${MIN_ENTRIES_FOR_INSIGHTS} journal entries in the last ${LOOKBACK_DAYS} days to find patterns. You have ${journal.length}.`,
      };
      return new Response(JSON.stringify({ success: true, ...resp }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
      });
    }

    // Compact data dump
    const journalLines = journal.map((e: any) => {
      const tags = (e.tags || []).length > 0 ? ` [${(e.tags || []).map((t: string) => "#" + t).join(" ")}]` : "";
      const pain = e.pain_level ? ` pain=${e.pain_level}/10` : "";
      const mood = e.mood ? ` mood=${e.mood}/5` : "";
      return `${e.entry_date}${tags}${pain}${mood}: ${String(e.body || "").replace(/\s+/g, " ").slice(0, 500)}`;
    });

    const mealsByDate = new Map<string, { count: number; protein: number; irritant: number; antiInflam: number }>();
    for (const m of mealsResp.data || []) {
      const b = mealsByDate.get(m.date) || { count: 0, protein: 0, irritant: 0, antiInflam: 0 };
      b.count += 1;
      b.protein += Number(m.protein_grams || 0);
      if (m.irritant_violation) b.irritant += 1;
      if (m.anti_inflammatory) b.antiInflam += 1;
      mealsByDate.set(m.date, b);
    }

    const fastsByDate = new Map<string, number>();
    for (const f of fastsResp.data || []) {
      const d = String(f.start_time).slice(0, 10);
      fastsByDate.set(d, Math.max(fastsByDate.get(d) || 0, Number(f.fasting_hours || 0)));
    }

    const exerciseByDate = new Map<string, number>();
    for (const e of exerciseResp.data || []) {
      exerciseByDate.set(e.date, (exerciseByDate.get(e.date) || 0) + Number(e.minutes || 0));
    }

    const companionLines: string[] = [];
    for (const l of journal) {
      const d = l.entry_date;
      const parts: string[] = [];
      const meals = mealsByDate.get(d);
      if (meals) parts.push(`meals=${meals.count} protein=${Math.round(meals.protein)}g${meals.irritant ? ` irritant=${meals.irritant}` : ""}${meals.antiInflam ? ` ai=${meals.antiInflam}` : ""}`);
      const fast = fastsByDate.get(d);
      if (fast) parts.push(`fast=${fast.toFixed(1)}h`);
      const ex = exerciseByDate.get(d);
      if (ex) parts.push(`exercise=${ex}min`);
      if (parts.length > 0) companionLines.push(`${d}: ${parts.join(" ")}`);
    }

    const dataSummary = [
      `JOURNAL (${journal.length} entries, last ${LOOKBACK_DAYS} days):`,
      ...journalLines,
      "",
      companionLines.length > 0 ? "COMPANION DATA BY DATE:" : "",
      ...companionLines,
    ].filter(Boolean).join("\n");

    const systemPrompt = [
      "You are reading a user's journal entries and companion tracking data for the past 14 days.",
      "Your ONLY job is to find 2-3 non-obvious patterns or correlations and state them concisely.",
      "Each insight must be: (a) specific — cite concrete dates, tags, or numbers; (b) actionable or revealing — something a human review would not catch on a quick scan; (c) honest — do NOT invent patterns that aren't there.",
      "Respond with strict JSON of the form: {\"insights\": [\"<sentence 1>\", \"<sentence 2>\", \"<sentence 3>\"]}. Each string is ONE sentence, ≤200 characters. No markdown, no bullets in the strings themselves.",
      "Prefer patterns involving multiple data types: journal mood × fasting hours, pain level × specific tags, streaks of a behavior × specific dates of the week.",
      "If genuinely nothing non-obvious stands out, return {\"insights\": [\"<single honest observation>\"]}. Don't pad.",
      profile?.ai_prompt ? `\nUser context: ${profile.ai_prompt}` : "",
      profile?.health_goals ? `\nUser health goals: ${profile.health_goals}` : "",
    ].join("\n");

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
        system: systemPrompt,
        messages: [{ role: "user", content: dataSummary }],
      }),
    });

    if (!claudeResponse.ok) {
      const errBody = await claudeResponse.text();
      console.error("Claude API error:", claudeResponse.status, errBody);
      await logAiUsage(supabase, {
        userId: user.id,
        functionName: "ai-journal-insights",
        model: MODEL_COACH,
        usedFallbackKey,
        status: "error",
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
      functionName: "ai-journal-insights",
      model: claudeData.model || MODEL_COACH,
      usage: claudeData.usage,
      usedFallbackKey,
    });

    let insights: string[] = [];
    const parsed = extractJson<{ insights?: unknown }>(responseText);
    if (parsed && Array.isArray(parsed.insights)) {
      insights = parsed.insights.filter((s: unknown): s is string => typeof s === "string").slice(0, 3);
    } else {
      // Fallback: if Claude didn't produce valid JSON, treat the first line as a single insight.
      const first = responseText.split("\n").map((l: string) => l.trim()).find((l: string) => l.length > 0);
      if (first) insights = [first];
    }

    const resp: InsightsResponse = {
      insights,
      asOfDate,
      entryCount: journal.length,
    };

    return new Response(JSON.stringify({ success: true, ...resp }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
    });
  } catch (error: any) {
    console.error("ai-journal-insights error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
    });
  }
};

serve(handler);
