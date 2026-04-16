import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "npm:resend@2.0.0";

// Cron-driven sender for system emails (profile_completion, inactivity_reminder).
// Each type is rate-limited via last_*_email_at columns on profiles so the same
// user doesn't get pestered daily. Designed to run once per day.

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "HealthZone <healthzone@mgm.zone>";
const APP_URL = Deno.env.get("APP_URL") || "https://healthzone.mgm.zone";

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

function replaceAll(input: string, placeholders: Record<string, string>): string {
  let out = input;
  for (const [k, v] of Object.entries(placeholders)) {
    out = out.split(`{{${k}}}`).join(v ?? "");
  }
  return out;
}

function unsubscribeUrl(token: string): string {
  return `${supabaseUrl}/functions/v1/unsubscribe-email?token=${encodeURIComponent(token)}&type=system`;
}

async function loadTemplate(type: string): Promise<{ subject: string; html_content: string } | null> {
  const { data, error } = await supabase
    .from("email_templates")
    .select("subject, html_content")
    .eq("type", type)
    .eq("is_active", true)
    .maybeSingle();
  if (error) {
    console.error(`Template ${type} load error:`, error);
    return null;
  }
  return data;
}

// True if the profile is missing any of the core fields.
function isProfileIncomplete(p: any): boolean {
  return !p.birth_date || !p.gender || !p.height || !p.target_weight || !p.measurement_unit;
}

async function getLastActivityAt(userId: string): Promise<Date | null> {
  // Pick the latest across the three tracked surfaces. Cheap since we only
  // need the most recent row each.
  const [weigh, meal, exercise] = await Promise.all([
    supabase.from("weigh_ins").select("date").eq("user_id", userId).order("date", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("meal_logs").select("date").eq("user_id", userId).order("date", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("exercise_logs").select("created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  const candidates: Date[] = [];
  if (weigh.data?.date) candidates.push(new Date(weigh.data.date));
  if (meal.data?.date) candidates.push(new Date(meal.data.date));
  if (exercise.data?.created_at) candidates.push(new Date(exercise.data.created_at));
  if (candidates.length === 0) return null;
  return candidates.reduce((a, b) => (a > b ? a : b));
}

async function sendEmailFromTemplate(opts: {
  type: "profile_completion" | "inactivity_reminder" | "milestone_reminder";
  to: string;
  placeholders: Record<string, string>;
}): Promise<void> {
  const template = await loadTemplate(opts.type);
  if (!template) throw new Error(`No active template for ${opts.type}`);
  const subject = replaceAll(template.subject, opts.placeholders);
  const html = replaceAll(template.html_content, opts.placeholders);
  await resend.emails.send({ from: FROM_EMAIL, to: [opts.to], subject, html });
}

async function processMilestoneReminders(): Promise<{ sent: number; skipped: number }> {
  // Fetch every priority milestone whose date falls in the next 7 days and whose
  // user hasn't opted out of system emails.
  const today = new Date();
  const in8Days = new Date(today);
  in8Days.setDate(today.getDate() + 8);

  const { data: milestones, error } = await supabase
    .from("period_milestones")
    .select(`
      id, user_id, name, date, reminder_sent_7d_at, reminder_sent_1d_at,
      profiles:user_id (
        first_name, email_unsubscribe_token, system_notification_emails
      )
    `)
    .eq("is_priority", true)
    .gte("date", today.toISOString().split("T")[0])
    .lte("date", in8Days.toISOString().split("T")[0]);

  if (error) {
    console.error("Milestone fetch error:", error);
    return { sent: 0, skipped: 0 };
  }

  let sent = 0, skipped = 0;
  for (const m of milestones || []) {
    try {
      const p = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
      if (!p || p.system_notification_emails === false) { skipped++; continue; }

      const milestoneDate = new Date(`${m.date}T12:00:00`);
      const daysUntil = Math.round((milestoneDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
      const marker: "7d" | "1d" | null = daysUntil === 7 ? "7d" : daysUntil === 1 ? "1d" : null;
      if (!marker) { skipped++; continue; }
      const alreadySent = marker === "7d" ? m.reminder_sent_7d_at : m.reminder_sent_1d_at;
      if (alreadySent) { skipped++; continue; }

      const { data: authUser } = await supabase.auth.admin.getUserById(m.user_id);
      const email = authUser?.user?.email;
      if (!email) { skipped++; continue; }

      const label = marker === "7d" ? "1 week until" : "Tomorrow:";
      const dateFormatted = milestoneDate.toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric", year: "numeric",
      });
      await sendEmailFromTemplate({
        type: "milestone_reminder",
        to: email,
        placeholders: {
          name: p.first_name || "there",
          appUrl: APP_URL,
          unsubscribeUrl: unsubscribeUrl(p.email_unsubscribe_token || ""),
          milestoneName: m.name,
          milestoneDateFormatted: dateFormatted,
          countdownLabel: label,
          daysUntil: String(daysUntil),
        },
      });

      const update = marker === "7d"
        ? { reminder_sent_7d_at: new Date().toISOString() }
        : { reminder_sent_1d_at: new Date().toISOString() };
      await supabase.from("period_milestones").update(update).eq("id", m.id);
      sent++;
    } catch (err) {
      console.error("Milestone reminder failed for", m.id, err);
      skipped++;
    }
  }
  return { sent, skipped };
}

const handler = async (req: Request): Promise<Response> => {
  try {
    const cronSecret = Deno.env.get("CRON_SECRET");
    const authHeader = req.headers.get("Authorization") || "";
    const providedSecret = authHeader.replace("Bearer ", "");
    if (!cronSecret || !timingSafeEqual(providedSecret, cronSecret)) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401, headers: { "Content-Type": "application/json" },
      });
    }

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, birth_date, gender, height, target_weight, measurement_unit, system_notification_emails, email_unsubscribe_token, last_profile_completion_email_at, last_inactivity_email_at, created_at")
      .eq("system_notification_emails", true);
    if (error) throw new Error(`Error fetching profiles: ${error.message}`);

    const now = new Date();
    const profileCompletionCooldownMs = 7 * 24 * 60 * 60 * 1000;
    const inactivityCooldownMs = 14 * 24 * 60 * 60 * 1000;
    const inactivityThresholdDays = 14;
    const minAccountAgeDays = 7; // don't nag brand-new users

    let sentProfileCompletion = 0;
    let sentInactivity = 0;
    let skipped = 0;

    for (const profile of profiles || []) {
      try {
        const { data: authUser, error: userError } = await supabase.auth.admin.getUserById(profile.id);
        if (userError || !authUser.user?.email) { skipped++; continue; }
        const email = authUser.user.email;
        const accountAgeDays = (now.getTime() - new Date(profile.created_at).getTime()) / (24 * 60 * 60 * 1000);

        const basePlaceholders = {
          name: profile.first_name || "there",
          appUrl: APP_URL,
          unsubscribeUrl: unsubscribeUrl(profile.email_unsubscribe_token || ""),
        };

        // 1) Profile completion reminder
        if (isProfileIncomplete(profile) && accountAgeDays >= 1) {
          const lastSent = profile.last_profile_completion_email_at ? new Date(profile.last_profile_completion_email_at) : null;
          if (!lastSent || now.getTime() - lastSent.getTime() >= profileCompletionCooldownMs) {
            await sendEmailFromTemplate({ type: "profile_completion", to: email, placeholders: basePlaceholders });
            await supabase.from("profiles").update({ last_profile_completion_email_at: now.toISOString() }).eq("id", profile.id);
            sentProfileCompletion++;
            continue; // don't also send inactivity on the same run
          }
        }

        // 2) Inactivity reminder — skip for users too new to be "inactive"
        if (accountAgeDays >= minAccountAgeDays) {
          const lastActivity = await getLastActivityAt(profile.id);
          const daysInactive = lastActivity
            ? Math.floor((now.getTime() - lastActivity.getTime()) / (24 * 60 * 60 * 1000))
            : Math.floor(accountAgeDays);
          if (daysInactive >= inactivityThresholdDays) {
            const lastSent = profile.last_inactivity_email_at ? new Date(profile.last_inactivity_email_at) : null;
            if (!lastSent || now.getTime() - lastSent.getTime() >= inactivityCooldownMs) {
              await sendEmailFromTemplate({
                type: "inactivity_reminder",
                to: email,
                placeholders: { ...basePlaceholders, daysInactive: String(daysInactive) },
              });
              await supabase.from("profiles").update({ last_inactivity_email_at: now.toISOString() }).eq("id", profile.id);
              sentInactivity++;
            }
          }
        }
      } catch (err: any) {
        console.error(`system email failed for ${profile.id}:`, err);
        skipped++;
      }
    }

    const milestoneResult = await processMilestoneReminders();

    return new Response(JSON.stringify({
      success: true,
      sent_profile_completion: sentProfileCompletion,
      sent_inactivity: sentInactivity,
      sent_milestone_reminder: milestoneResult.sent,
      skipped,
      milestone_skipped: milestoneResult.skipped,
      considered: profiles?.length || 0,
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error: any) {
    console.error("send-system-emails error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }
};

serve(handler);
