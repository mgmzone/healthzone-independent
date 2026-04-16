
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "npm:resend@2.0.0";
import {
  buildDataSummary,
  callClaudeForFeedback,
  EMPTY_FEEDBACK,
  fetchWeeklyData,
  resolveClaudeApiKey,
} from "../_shared/aiFeedback.ts";
import { logAiUsage } from "../_shared/aiUsage.ts";

// Initialize Resend with API key from environment variables
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Initialize Supabase client with admin privileges for the edge function
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

interface UserWeeklyData {
  userId: string;
  email: string;
  name: string;
  weighIns: number;
  fastingDays: number;
  exercises: number;
  mealsLogged: number;
  avgDailyProtein: number;
  irritantViolations: number;
  goalCompliance: number;
  aiSummary: string;
  aiHighlights: string[];
  aiConcerns: string[];
  aiTip: string;
}

// Generate HTML email
function generateEmailHtml(data: UserWeeklyData, appUrl: string): { subject: string; html: string } {
  const aiSection = data.aiSummary ? `
    <div style="margin: 20px 0; padding: 15px; background-color: #f3f0ff; border-left: 4px solid #8b5cf6; border-radius: 4px;">
      <h3 style="margin: 0 0 8px 0; color: #6d28d9; font-size: 14px;">AI Coach Insights</h3>
      <p style="margin: 0 0 12px 0; color: #374151; font-size: 14px;">${data.aiSummary}</p>
      ${data.aiHighlights.length > 0 ? `
        <div style="margin-bottom: 8px;">
          ${data.aiHighlights.map(h => `<div style="color: #059669; font-size: 13px; margin-bottom: 4px;">&#10003; ${h}</div>`).join("")}
        </div>
      ` : ""}
      ${data.aiConcerns.length > 0 ? `
        <div style="margin-bottom: 8px;">
          ${data.aiConcerns.map(c => `<div style="color: #d97706; font-size: 13px; margin-bottom: 4px;">&#9888; ${c}</div>`).join("")}
        </div>
      ` : ""}
      ${data.aiTip ? `
        <div style="margin-top: 8px; padding: 8px 12px; background-color: #fef9c3; border-radius: 4px; font-size: 13px; color: #854d0e;">
          &#128161; <strong>Tip:</strong> ${data.aiTip}
        </div>
      ` : ""}
    </div>
  ` : "";

  return {
    subject: "Your Weekly HealthZone Summary",
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f2937;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; color: white; font-size: 22px;">Weekly Summary</h1>
          <p style="margin: 4px 0 0; color: #dbeafe; font-size: 14px;">Hello ${data.name}, here's your week in review</p>
        </div>

        <div style="padding: 24px; background: white; border: 1px solid #e5e7eb; border-top: none;">
          <div style="display: flex; gap: 12px; margin-bottom: 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td width="33%" style="padding: 12px; background: #f0f9ff; border-radius: 8px; text-align: center;">
                  <div style="font-size: 24px; font-weight: bold; color: #2563eb;">${data.weighIns}</div>
                  <div style="font-size: 12px; color: #6b7280; margin-top: 2px;">Weigh-ins</div>
                </td>
                <td width="4"></td>
                <td width="33%" style="padding: 12px; background: #f0fdf4; border-radius: 8px; text-align: center;">
                  <div style="font-size: 24px; font-weight: bold; color: #16a34a;">${data.exercises}</div>
                  <div style="font-size: 12px; color: #6b7280; margin-top: 2px;">Workouts</div>
                </td>
                <td width="4"></td>
                <td width="33%" style="padding: 12px; background: #fef3c7; border-radius: 8px; text-align: center;">
                  <div style="font-size: 24px; font-weight: bold; color: #d97706;">${data.fastingDays}</div>
                  <div style="font-size: 12px; color: #6b7280; margin-top: 2px;">Fasting Days</div>
                </td>
              </tr>
            </table>
          </div>

          <div style="margin: 20px 0; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #374151;">Nutrition</h3>
            <p style="margin: 0; font-size: 14px; color: #6b7280;">
              ${data.mealsLogged} meals logged &bull;
              ${data.avgDailyProtein}g avg daily protein &bull;
              ${data.irritantViolations > 0 ? `<span style="color: #dc2626;">${data.irritantViolations} irritant violation${data.irritantViolations > 1 ? 's' : ''}</span>` : '<span style="color: #059669;">No irritant violations</span>'}
            </p>
            ${data.goalCompliance > 0 ? `<p style="margin: 8px 0 0; font-size: 14px; color: #6b7280;">Daily goal compliance: <strong>${data.goalCompliance}%</strong></p>` : ""}
          </div>

          ${aiSection}

          <div style="text-align: center; margin-top: 24px;">
            <a href="${appUrl}/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 14px;">
              View Dashboard
            </a>
          </div>
        </div>

        <div style="padding: 16px; text-align: center; font-size: 12px; color: #9ca3af;">
          <p style="margin: 0;">HealthZone &bull; <a href="${appUrl}/profile" style="color: #9ca3af;">Manage email preferences</a></p>
        </div>
      </div>
    `,
  };
}

// Main handler
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

const handler = async (_req: Request): Promise<Response> => {
  try {
    // Verify cron secret to prevent unauthorized invocations
    const cronSecret = Deno.env.get("CRON_SECRET");
    const authHeader = _req.headers.get("Authorization") || "";
    const providedSecret = authHeader.replace("Bearer ", "");

    if (!cronSecret || !timingSafeEqual(providedSecret, cronSecret)) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("Starting weekly summary email job");

    // Get users who opted into weekly emails
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, claude_api_key, ai_prompt, health_goals, target_weight, current_weight, protein_target_min, protein_target_max")
      .eq("weekly_summary_emails", true);

    if (profilesError) {
      throw new Error(`Error fetching profiles: ${profilesError.message}`);
    }

    console.log(`Found ${profiles.length} users with weekly email enabled`);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const dateStr = oneWeekAgo.toISOString().split("T")[0];
    const appUrl = Deno.env.get("APP_URL") || "https://healthzone.mgm.zone";

    let successCount = 0;
    let errorCount = 0;

    for (const profile of profiles) {
      try {
        // Get user email
        const { data: user, error: userError } = await supabase.auth.admin.getUserById(profile.id);
        if (userError || !user.user?.email) {
          console.error(`No email for user ${profile.id}`);
          continue;
        }

        // Fetch all weekly data in parallel
        const [mealsResult, weighInsResult, exerciseResult, fastingResult, goalsResult] = await Promise.all([
          supabase.from("meal_logs").select("date, meal_slot, protein_grams, carbs_grams, fat_grams, sodium_mg, calories, irritant_violation, irritant_notes, protein_source, anti_inflammatory, notes, ai_assessment").eq("user_id", profile.id).gte("date", dateStr).order("date", { ascending: false }),
          supabase.from("weigh_ins").select("date, weight").eq("user_id", profile.id).gte("date", dateStr).order("date", { ascending: false }),
          supabase.from("exercise_logs").select("date, type, activity_name, minutes, intensity, calories_burned, distance").eq("user_id", profile.id).gte("created_at", dateStr + "T00:00:00"),
          supabase.from("fasting_logs").select("start_time, fasting_hours").eq("user_id", profile.id).gte("start_time", dateStr + "T00:00:00"),
          supabase.from("daily_goal_entries").select("date, met").eq("user_id", profile.id).gte("date", dateStr),
        ]);

        const meals = mealsResult.data || [];
        const weighIns = weighInsResult.data || [];
        const exercises = exerciseResult.data || [];
        const fasting = fastingResult.data || [];
        const goalEntries = goalsResult.data || [];

        // Calculate stats
        const totalProtein = meals.reduce((sum, m) => sum + (m.protein_grams || 0), 0);
        const daysWithMeals = new Set(meals.map(m => m.date)).size;
        const avgDailyProtein = daysWithMeals > 0 ? Math.round(totalProtein / daysWithMeals) : 0;
        const irritantViolations = meals.filter(m => m.irritant_violation).length;
        const goalsMet = goalEntries.filter(g => g.met).length;
        const goalCompliance = goalEntries.length > 0 ? Math.round((goalsMet / goalEntries.length) * 100) : 0;

        // Get AI feedback — matches dashboard logic; falls back to server key when user has none
        const userKey = (profile.claude_api_key && profile.claude_api_key.trim()) || "";
        const fallbackKey = (Deno.env.get("CLAUDE_API_KEY_FALLBACK") || "").trim();
        const apiKey = resolveClaudeApiKey(profile.claude_api_key, Deno.env.get("CLAUDE_API_KEY_FALLBACK"));
        const usedFallbackKey = !userKey && !!fallbackKey;
        let aiFeedback = EMPTY_FEEDBACK;
        if (apiKey) {
          try {
            const dataSummary = buildDataSummary({ meals, weighIns, exercises, fasting, goalEntries }, profile);
            const { feedback, model, usage } = await callClaudeForFeedback(apiKey, profile, dataSummary);
            aiFeedback = feedback;
            await logAiUsage(supabase, {
              userId: profile.id,
              functionName: 'send-weekly-summary',
              model,
              usage,
              usedFallbackKey,
            });
          } catch (err: any) {
            console.error(`AI feedback failed for user ${profile.id}:`, err);
            await logAiUsage(supabase, {
              userId: profile.id,
              functionName: 'send-weekly-summary',
              model: 'claude-sonnet-4-20250514',
              usedFallbackKey,
              status: 'error',
              error: err?.message || 'Claude API error',
            });
          }
        }

        const name = `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "there";

        const weeklyData: UserWeeklyData = {
          userId: profile.id,
          email: user.user.email,
          name,
          weighIns: weighIns.length,
          fastingDays: fasting.length,
          exercises: exercises.length,
          mealsLogged: meals.length,
          avgDailyProtein,
          irritantViolations,
          goalCompliance,
          aiSummary: aiFeedback.summary,
          aiHighlights: aiFeedback.highlights,
          aiConcerns: aiFeedback.concerns,
          aiTip: aiFeedback.tip,
        };

        // Generate and send email
        const emailContent = generateEmailHtml(weeklyData, appUrl);
        const fromEmail = Deno.env.get("FROM_EMAIL") || "HealthZone <healthzone@mgm.zone>";

        await resend.emails.send({
          from: fromEmail,
          to: [weeklyData.email],
          subject: emailContent.subject,
          html: emailContent.html,
        });

        console.log(`Sent weekly summary to ${weeklyData.email}`);
        successCount++;
      } catch (error) {
        console.error(`Error processing user ${profile.id}:`, error);
        errorCount++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Weekly summary complete. Sent ${successCount} emails, ${errorCount} errors.`,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in weekly summary job:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
