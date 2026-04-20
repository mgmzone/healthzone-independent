import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { checkFallbackDailyCap, logAiUsage } from "../_shared/aiUsage.ts";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { MODEL_COACH } from "../_shared/models.ts";

// Claude-generated pre-visit medical summary. User picks a date range and
// optional tag filter; we pull the matching journal entries + weight trend
// + compliance summary and ask Sonnet to structure a 1-page report the
// user can copy into a doctor's portal or print.

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

interface RequestBody {
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string;   // YYYY-MM-DD (inclusive)
  tags?: string[];   // if present, filter journal entries by tag overlap
  focus?: string;    // free-text "what do you want to emphasize"
}

function daysBetween(a: string, b: string): number {
  const ms = new Date(b + "T00:00:00Z").getTime() - new Date(a + "T00:00:00Z").getTime();
  return Math.max(1, Math.round(ms / (24 * 60 * 60 * 1000)));
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

    const body: RequestBody = await req.json().catch(() => ({}));
    const today = new Date().toISOString().slice(0, 10);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const dateFrom = body.dateFrom || thirtyDaysAgo;
    const dateTo = body.dateTo || today;
    const tagFilter = Array.isArray(body.tags) && body.tags.length > 0 ? body.tags : null;
    const focus = typeof body.focus === "string" ? body.focus.trim().slice(0, 300) : "";

    // Load profile for context + key + cap check
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("claude_api_key, first_name, last_name, health_goals, birth_date, gender, height, current_weight, target_weight, measurement_unit")
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

    // Journal entries — with optional tag filter via overlaps
    let journalQuery = supabase
      .from("journal_entries")
      .select("entry_date, entry_time, title, body, tags, pain_level, mood")
      .eq("user_id", user.id)
      .gte("entry_date", dateFrom)
      .lte("entry_date", dateTo)
      .order("entry_date", { ascending: true });
    if (tagFilter) journalQuery = journalQuery.overlaps("tags", tagFilter);
    const { data: journal, error: journalError } = await journalQuery;
    if (journalError) {
      console.error("journal query error:", journalError);
    }

    // Weight trend
    const { data: weighIns } = await supabase
      .from("weigh_ins")
      .select("date, weight")
      .eq("user_id", user.id)
      .gte("date", dateFrom)
      .lte("date", dateTo)
      .order("date", { ascending: true });

    // Compliance
    const { data: goalEntries } = await supabase
      .from("daily_goal_entries")
      .select("date, met, goal_id")
      .eq("user_id", user.id)
      .gte("date", dateFrom)
      .lte("date", dateTo);
    const { data: activeGoals } = await supabase
      .from("daily_goals")
      .select("id, name, category")
      .eq("user_id", user.id)
      .eq("is_active", true);

    // Build a compact data dump for the prompt
    const summaryParts: string[] = [];
    summaryParts.push(`PATIENT: ${(profile.first_name || "").trim()} ${(profile.last_name || "").trim()}`.trim());
    if (profile.birth_date) summaryParts.push(`DOB: ${profile.birth_date}`);
    if (profile.gender) summaryParts.push(`Gender: ${profile.gender}`);
    if (profile.height) summaryParts.push(`Height: ${profile.height} cm`);
    if (profile.health_goals) summaryParts.push(`Health goals on file: ${profile.health_goals}`);
    summaryParts.push(`Report window: ${dateFrom} → ${dateTo} (${daysBetween(dateFrom, dateTo)} days)`);

    if (weighIns && weighIns.length > 0) {
      const first = Number(weighIns[0].weight);
      const last = Number(weighIns[weighIns.length - 1].weight);
      const unit = profile.measurement_unit === "imperial" ? "lbs" : "kg";
      const toDisplay = (kg: number) => (profile.measurement_unit === "imperial" ? kg * 2.20462 : kg);
      const change = toDisplay(last) - toDisplay(first);
      summaryParts.push(
        `WEIGHT: ${weighIns.length} weigh-ins. Start ${toDisplay(first).toFixed(1)} ${unit}, latest ${toDisplay(last).toFixed(1)} ${unit}. Change ${change >= 0 ? "+" : ""}${change.toFixed(1)} ${unit}.`
      );
    } else {
      summaryParts.push("WEIGHT: no weigh-ins in window.");
    }

    if ((goalEntries || []).length > 0 && (activeGoals || []).length > 0) {
      const metCount = (goalEntries || []).filter((g: any) => g.met).length;
      const compliance = Math.round((metCount / (goalEntries || []).length) * 100);
      summaryParts.push(`DAILY GOALS: ${metCount}/${(goalEntries || []).length} met (${compliance}% compliance) across ${(activeGoals || []).length} active goals.`);
    }

    const journalLines = (journal || []).map((e: any) => {
      const tags = (e.tags || []).length > 0 ? ` [${(e.tags || []).map((t: string) => "#" + t).join(" ")}]` : "";
      const pain = e.pain_level ? ` pain=${e.pain_level}/10` : "";
      const mood = e.mood ? ` mood=${e.mood}/5` : "";
      const time = e.entry_time ? ` ${String(e.entry_time).slice(0, 5)}` : "";
      const title = e.title ? ` ${e.title}:` : "";
      return `- ${e.entry_date}${time}${title}${tags}${pain}${mood}\n  ${String(e.body || "").replace(/\s+/g, " ").slice(0, 1200)}`;
    });

    if (journalLines.length > 0) {
      summaryParts.push(`JOURNAL (${journalLines.length} entries${tagFilter ? `, tags: ${tagFilter.map((t) => "#" + t).join(" ")}` : ""}):\n${journalLines.join("\n\n")}`);
    } else {
      summaryParts.push(`JOURNAL: no entries in window${tagFilter ? ` matching tags ${tagFilter.map((t) => "#" + t).join(" ")}` : ""}.`);
    }

    const dataSummary = summaryParts.join("\n\n");

    const focusLine = focus
      ? `The patient specifically wants this report to emphasize: ${focus}`
      : `No specific focus area provided — cover what stands out in the data.`;

    const systemPrompt = [
      "You are a clinical scribe. You are generating a one-page pre-visit summary that a patient will share with their doctor or copy into a patient portal.",
      "Write in a neutral, factual, medical-note voice. Third person (\"the patient\" or use their first name) or first person (\"I noticed\" from the patient's voice) — pick one and stay consistent. Do NOT prescribe, diagnose, or advise treatment. You are summarizing the patient's own journal, tracking, and self-report.",
      "Output ONLY markdown. Structure it with these sections, in order:",
      "  # Pre-visit summary — <date range>",
      "  ## Overall",
      "  ## Weight & body-composition trend",
      "  ## Notable events, side effects, and symptoms",
      "  ## Medications mentioned",
      "  ## Pain, mood, and energy",
      "  ## Compliance & routine",
      "  ## Questions / things I'd like to discuss",
      "Each section: a short paragraph OR a bulleted list. Be concrete. Quote short phrases from journal entries with their dates when doing so sharpens the point. If a section has no data, say so in one line rather than padding.",
      "Do not invent facts. Do not extrapolate beyond what the data says. If symptoms, meds, or concerns are not present in the data, say so.",
      "Length: aim for 250-500 words total. A doctor should be able to read it in under 2 minutes.",
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
        max_tokens: 1800,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Here is my tracking data and journal for the window. Please generate the pre-visit summary.\n\n${focusLine}\n\n---\n\n${dataSummary}`,
          },
        ],
      }),
    });

    if (!claudeResponse.ok) {
      const errorBody = await claudeResponse.text();
      console.error("Claude API error:", claudeResponse.status, errorBody);
      await logAiUsage(supabase, {
        userId: user.id,
        functionName: "generate-doctor-report",
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
    const reportText = claudeData.content?.[0]?.text || "";
    await logAiUsage(supabase, {
      userId: user.id,
      functionName: "generate-doctor-report",
      model: claudeData.model || MODEL_COACH,
      usage: claudeData.usage,
      usedFallbackKey,
    });

    return new Response(
      JSON.stringify({
        success: true,
        report: reportText,
        dateFrom,
        dateTo,
        entryCount: (journal || []).length,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) } }
    );
  } catch (error: any) {
    console.error("generate-doctor-report error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
    });
  }
};

serve(handler);
