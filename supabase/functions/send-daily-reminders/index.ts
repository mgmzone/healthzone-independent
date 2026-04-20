import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "npm:resend@2.0.0";

// Cron-driven "nightly summary" mailer. Fires every hour via pg_cron; each
// fire picks the users whose *local* time is currently 8 PM and sends them
// a one-pager about today. Off-by-default (daily_reminder_enabled).

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "HealthZone <healthzone@mgm.zone>";
const APP_URL = Deno.env.get("APP_URL") || "https://healthzone.mgm.zone";
const REMINDER_HOUR = 20; // 8 PM local

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

// Returns the date "today" in the given IANA timezone as YYYY-MM-DD.
// Uses Intl so we don't need a tz library bundled.
function todayInZone(zone: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: zone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());
    const y = parts.find((p) => p.type === "year")?.value ?? "1970";
    const m = parts.find((p) => p.type === "month")?.value ?? "01";
    const d = parts.find((p) => p.type === "day")?.value ?? "01";
    return `${y}-${m}-${d}`;
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

interface TodaySummary {
  mealsLogged: number;
  targetMeals: number;
  proteinG: number;
  proteinMin: number;
  proteinMax: number;
  fastingActive: boolean;
  fastingHoursToday: number | null;
  exerciseMinutes: number;
  weightLogged: boolean;
  journalLogged: boolean;
  goalsTotal: number;
  goalsMet: number;
}

async function fetchTodaySummary(userId: string, dateStr: string, profile: any): Promise<TodaySummary> {
  const [meals, exercises, fasts, weighIns, journals, activeGoals, goalEntries] = await Promise.all([
    supabase
      .from("meal_logs")
      .select("protein_grams")
      .eq("user_id", userId)
      .eq("date", dateStr),
    supabase
      .from("exercise_logs")
      .select("minutes")
      .eq("user_id", userId)
      .eq("date", dateStr),
    // Fasting crosses midnight, so pull anything that started today OR is still open.
    supabase
      .from("fasting_logs")
      .select("start_time, end_time, fasting_hours")
      .eq("user_id", userId)
      .gte("start_time", `${dateStr}T00:00:00`)
      .lte("start_time", `${dateStr}T23:59:59`)
      .order("start_time", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("weigh_ins")
      .select("id")
      .eq("user_id", userId)
      .eq("date", dateStr)
      .limit(1)
      .maybeSingle(),
    supabase
      .from("journal_entries")
      .select("id")
      .eq("user_id", userId)
      .eq("entry_date", dateStr)
      .limit(1)
      .maybeSingle(),
    supabase
      .from("daily_goals")
      .select("id")
      .eq("user_id", userId)
      .eq("is_active", true),
    supabase
      .from("daily_goal_entries")
      .select("met")
      .eq("user_id", userId)
      .eq("date", dateStr),
  ]);

  const mealRows = meals.data || [];
  const mealsLogged = mealRows.length;
  const proteinG = Math.round(mealRows.reduce((sum: number, m: any) => sum + Number(m.protein_grams || 0), 0));

  const exerciseMinutes = (exercises.data || []).reduce((s: number, e: any) => s + Number(e.minutes || 0), 0);

  const fastRow: any = fasts.data;
  const fastingActive = !!fastRow && !fastRow.end_time;
  const fastingHoursToday = fastRow && fastRow.fasting_hours ? Number(fastRow.fasting_hours) : null;

  const goalsTotal = (activeGoals.data || []).length;
  const goalsMet = (goalEntries.data || []).filter((g: any) => g.met).length;

  return {
    mealsLogged,
    targetMeals: profile.target_meals_per_day || 3,
    proteinG,
    proteinMin: profile.protein_target_min || 130,
    proteinMax: profile.protein_target_max || 150,
    fastingActive,
    fastingHoursToday,
    exerciseMinutes,
    weightLogged: !!weighIns.data,
    journalLogged: !!journals.data,
    goalsTotal,
    goalsMet,
  };
}

function line(label: string, status: string, ok: boolean, href: string): string {
  const color = ok ? "#059669" : "#b45309";
  const bg = ok ? "#f0fdf4" : "#fffbeb";
  return `
  <tr>
    <td style="padding: 14px 16px; border-bottom: 1px solid #f1f5f9; background: ${bg};">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td style="font-weight: 600; font-size: 14px; color: #0f172a;">${label}</td>
          <td style="text-align: right;">
            <a href="${href}" style="color: ${color}; font-size: 13px; text-decoration: none; font-weight: 500;">${status} &rarr;</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function renderEmail(opts: {
  name: string;
  dateStr: string;
  summary: TodaySummary;
  unsubscribeUrl: string;
}): { subject: string; html: string } {
  const { name, dateStr, summary: s } = opts;
  const mealsOk = s.mealsLogged >= s.targetMeals;
  const proteinOk = s.proteinG >= s.proteinMin;
  const fastingOk = s.fastingActive || (s.fastingHoursToday !== null && s.fastingHoursToday > 0);
  const exerciseOk = s.exerciseMinutes > 0;
  const weightOk = s.weightLogged;
  const journalOk = s.journalLogged;
  const goalsOk = s.goalsTotal > 0 && s.goalsMet === s.goalsTotal;

  const mealsLabel = `Meals · ${s.mealsLogged}/${s.targetMeals} logged, ${s.proteinG}g protein (target ${s.proteinMin}–${s.proteinMax})`;
  const fastingLabel = s.fastingActive
    ? `Fasting · active`
    : s.fastingHoursToday !== null
    ? `Fasting · ${s.fastingHoursToday.toFixed(1)}h today`
    : `Fasting · nothing logged`;
  const exerciseLabel = s.exerciseMinutes > 0
    ? `Exercise · ${s.exerciseMinutes} min`
    : `Exercise · none logged`;
  const weightLabel = s.weightLogged ? `Weight · logged` : `Weight · not logged`;
  const journalLabel = s.journalLogged ? `Journal · entry today` : `Journal · nothing today`;
  const goalsLabel = s.goalsTotal > 0
    ? `Daily goals · ${s.goalsMet}/${s.goalsTotal} met`
    : `Daily goals · none set`;

  const mealsStatus = mealsOk ? (proteinOk ? "on track" : "protein low") : "log a meal";
  const fastingStatus = fastingOk ? "good" : "start fast";
  const exerciseStatus = exerciseOk ? "good" : "move a bit";
  const weightStatus = weightOk ? "done" : "log weight";
  const journalStatus = journalOk ? "done" : "add a note";
  const goalsStatus = s.goalsTotal === 0 ? "set some" : goalsOk ? "all met" : "finish out";

  const html = `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:24px;">
    <div style="background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
      <div style="padding:20px 24px;border-bottom:1px solid #e2e8f0;">
        <div style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.12em;">Today &mdash; ${dateStr}</div>
        <div style="font-size:22px;font-weight:600;color:#0f172a;margin-top:4px;">Good evening, ${name}.</div>
        <div style="font-size:14px;color:#475569;margin-top:6px;">Here's how your day looks. Tap anything that's missing to log it now.</div>
      </div>
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        ${line(mealsLabel, mealsStatus, mealsOk && proteinOk, `${APP_URL}/nutrition`)}
        ${line(fastingLabel, fastingStatus, fastingOk, `${APP_URL}/fasting`)}
        ${line(exerciseLabel, exerciseStatus, exerciseOk, `${APP_URL}/exercise`)}
        ${line(weightLabel, weightStatus, weightOk, `${APP_URL}/weight`)}
        ${line(goalsLabel, goalsStatus, goalsOk, `${APP_URL}/nutrition`)}
        ${line(journalLabel, journalStatus, journalOk, `${APP_URL}/journal`)}
      </table>
      <div style="padding:20px 24px;text-align:center;">
        <a href="${APP_URL}/dashboard" style="display:inline-block;padding:10px 20px;background:#0f172a;color:#fff;text-decoration:none;border-radius:8px;font-weight:500;font-size:14px;">Open dashboard</a>
      </div>
    </div>
    <div style="padding:16px 0;text-align:center;font-size:12px;color:#94a3b8;">
      HealthZone &bull; <a href="${opts.unsubscribeUrl}" style="color:#94a3b8;">Unsubscribe from daily reminders</a> &bull; <a href="${APP_URL}/profile" style="color:#94a3b8;">Manage preferences</a>
    </div>
  </div>
</body>
</html>`;

  return {
    subject: `Today's HealthZone check-in`,
    html,
  };
}

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  time_zone: string;
  target_meals_per_day: number | null;
  protein_target_min: number | null;
  protein_target_max: number | null;
  email_unsubscribe_token: string | null;
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const cronSecret = Deno.env.get("CRON_SECRET");
    const authHeader = req.headers.get("Authorization") || "";
    const providedSecret = authHeader.replace("Bearer ", "");
    if (!cronSecret || !timingSafeEqual(providedSecret, cronSecret)) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Test-mode overrides — still require CRON_SECRET. Lets us preview the
    // email on demand instead of waiting for 8 PM somewhere.
    //   force_user_id:  render for this specific user, skip the due-hour filter
    //   override_email: destination address (use when you want the preview
    //                   sent somewhere other than the profile's auth email)
    let body: { force_user_id?: string; override_email?: string } = {};
    try {
      if (req.method === "POST") {
        const text = await req.text();
        if (text) body = JSON.parse(text);
      }
    } catch {
      // Non-JSON or empty bodies are fine — production cron sends '{}'.
    }

    let list: Profile[];
    if (body.force_user_id) {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, first_name, last_name, time_zone, target_meals_per_day, protein_target_min, protein_target_max, email_unsubscribe_token"
        )
        .eq("id", body.force_user_id)
        .single();
      if (error || !data) {
        return new Response(
          JSON.stringify({ success: false, error: `force_user_id not found: ${error?.message}` }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      list = [data as Profile];
    } else {
      const { data: profiles, error: profilesError } = await supabase.rpc(
        "profiles_due_for_daily_reminder",
        { target_hour: REMINDER_HOUR }
      );
      if (profilesError) {
        console.error("Error fetching due profiles:", profilesError);
        return new Response(JSON.stringify({ success: false, error: profilesError.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
      list = (profiles || []) as Profile[];
    }

    console.log(
      `Daily reminder run: ${list.length} user(s) selected ${
        body.force_user_id ? "(forced)" : `(local hour = ${REMINDER_HOUR})`
      }`
    );

    let sent = 0;
    let errors = 0;

    for (const p of list) {
      try {
        let destination = body.override_email;
        if (!destination) {
          const { data: userRec } = await supabase.auth.admin.getUserById(p.id);
          destination = userRec?.user?.email ?? undefined;
        }
        if (!destination) {
          console.warn(`No email for ${p.id}, skipping`);
          continue;
        }

        const dateStr = todayInZone(p.time_zone);
        const summary = await fetchTodaySummary(p.id, dateStr, p);
        const name = (p.first_name || "there").trim();
        const unsubscribeUrl = p.email_unsubscribe_token
          ? `${supabaseUrl}/functions/v1/unsubscribe-email?token=${encodeURIComponent(p.email_unsubscribe_token)}&type=daily`
          : `${APP_URL}/profile`;

        const { subject, html } = renderEmail({ name, dateStr, summary, unsubscribeUrl });

        const result = await resend.emails.send({
          from: FROM_EMAIL,
          to: [destination],
          subject: body.force_user_id ? `[preview] ${subject}` : subject,
          html,
        });

        if ((result as any).error) {
          console.error(`Send error for ${p.id}:`, (result as any).error);
          errors++;
        } else {
          sent++;
        }
      } catch (err: any) {
        console.error(`Failed for user ${p.id}:`, err);
        errors++;
      }
    }

    return new Response(JSON.stringify({ success: true, due: list.length, sent, errors }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("send-daily-reminders error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

serve(handler);
