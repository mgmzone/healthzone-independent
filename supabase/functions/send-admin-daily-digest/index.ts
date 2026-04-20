import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "npm:resend@2.0.0";

// Once-a-day digest for admins: who was active today and what did AI cost.
// Scheduled at 10 UTC (6 AM ET) so Eastern admins see it with their coffee;
// "today" for each user is resolved in their own timezone server-side.

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

function fmtUsd(n: number): string {
  return `$${n.toFixed(n < 0.01 && n > 0 ? 4 : 2)}`;
}

function tick(b: boolean): string {
  return b
    ? `<span style="color:#059669;font-weight:600;">&#10003;</span>`
    : `<span style="color:#cbd5e1;">&#8212;</span>`;
}

interface ActiveUser {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  time_zone: string;
  logged_weight: boolean;
  logged_meal: boolean;
  logged_exercise: boolean;
  logged_fasting: boolean;
  logged_journal: boolean;
  logged_goal: boolean;
}

interface CostRow {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  own_key_usd: number;
  fallback_usd: number;
  total_usd: number;
  call_count: number;
}

function renderEmail(opts: {
  dateStr: string;
  active: ActiveUser[];
  costs: CostRow[];
}): { subject: string; html: string } {
  const { dateStr, active, costs } = opts;

  const totalFallback = costs.reduce((s, c) => s + Number(c.fallback_usd || 0), 0);
  const totalOwn = costs.reduce((s, c) => s + Number(c.own_key_usd || 0), 0);
  const totalAll = totalFallback + totalOwn;
  const totalCalls = costs.reduce((s, c) => s + Number(c.call_count || 0), 0);

  const activityRows = active.length
    ? active
        .map(
          (u) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#0f172a;">${
          `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.user_id.slice(0, 8)
        }</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:12px;color:#64748b;">${u.time_zone}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;text-align:center;">${tick(u.logged_weight)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;text-align:center;">${tick(u.logged_meal)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;text-align:center;">${tick(u.logged_fasting)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;text-align:center;">${tick(u.logged_exercise)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;text-align:center;">${tick(u.logged_goal)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;text-align:center;">${tick(u.logged_journal)}</td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="8" style="padding:16px;text-align:center;color:#94a3b8;font-size:13px;">No user activity today.</td></tr>`;

  const costRows = costs.length
    ? costs
        .map(
          (c) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#0f172a;">${
          `${c.first_name || ""} ${c.last_name || ""}`.trim() || c.user_id.slice(0, 8)
        }</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;text-align:right;font-size:13px;color:#334155;">${c.call_count}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;text-align:right;font-size:13px;color:#334155;">${fmtUsd(Number(c.own_key_usd || 0))}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;text-align:right;font-size:13px;color:${Number(c.fallback_usd) > 0 ? "#b45309" : "#cbd5e1"};">${fmtUsd(Number(c.fallback_usd || 0))}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;text-align:right;font-size:13px;font-weight:600;color:#0f172a;">${fmtUsd(Number(c.total_usd || 0))}</td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="5" style="padding:16px;text-align:center;color:#94a3b8;font-size:13px;">No AI calls today.</td></tr>`;

  const html = `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;">
  <div style="max-width:760px;margin:0 auto;padding:24px;">
    <div style="background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
      <div style="padding:20px 24px;border-bottom:1px solid #e2e8f0;">
        <div style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.12em;">Admin digest &mdash; ${dateStr}</div>
        <div style="font-size:20px;font-weight:600;color:#0f172a;margin-top:4px;">Yesterday at a glance</div>
        <div style="font-size:13px;color:#475569;margin-top:6px;">${active.length} active user${active.length === 1 ? "" : "s"} &bull; ${totalCalls} AI call${totalCalls === 1 ? "" : "s"} &bull; total cost ${fmtUsd(totalAll)} (fallback: ${fmtUsd(totalFallback)})</div>
      </div>

      <div style="padding:20px 24px;">
        <div style="font-size:14px;font-weight:600;color:#0f172a;margin-bottom:12px;">Activity by user</div>
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
          <thead>
            <tr style="background:#f8fafc;">
              <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #e2e8f0;">User</th>
              <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #e2e8f0;">TZ</th>
              <th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #e2e8f0;">Wt</th>
              <th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #e2e8f0;">Meal</th>
              <th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #e2e8f0;">Fast</th>
              <th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #e2e8f0;">Exer</th>
              <th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #e2e8f0;">Goal</th>
              <th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #e2e8f0;">Jrnl</th>
            </tr>
          </thead>
          <tbody>${activityRows}</tbody>
        </table>
      </div>

      <div style="padding:0 24px 20px;">
        <div style="font-size:14px;font-weight:600;color:#0f172a;margin-bottom:12px;">AI cost by user</div>
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
          <thead>
            <tr style="background:#f8fafc;">
              <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #e2e8f0;">User</th>
              <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #e2e8f0;">Calls</th>
              <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #e2e8f0;">Own key</th>
              <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #e2e8f0;">Fallback</th>
              <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #e2e8f0;">Total</th>
            </tr>
          </thead>
          <tbody>${costRows}</tbody>
        </table>
      </div>

      <div style="padding:16px 24px;border-top:1px solid #e2e8f0;text-align:center;">
        <a href="${APP_URL}/admin" style="display:inline-block;padding:10px 20px;background:#0f172a;color:#fff;text-decoration:none;border-radius:8px;font-weight:500;font-size:14px;">Open admin</a>
      </div>
    </div>
    <div style="padding:16px 0;text-align:center;font-size:12px;color:#94a3b8;">
      HealthZone Admin Digest &bull; sent daily to users with is_admin = true.
    </div>
  </div>
</body>
</html>`;

  return {
    subject: `HealthZone admin digest — ${dateStr} — ${active.length} active, ${fmtUsd(totalAll)} AI`,
    html,
  };
}

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

    // "Yesterday" in UTC is a fine default window for the cost rollup.
    // Activity is computed per-user-tz inside the RPC.
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const targetDate = yesterday.toISOString().slice(0, 10);

    const [activeResp, costResp, adminResp] = await Promise.all([
      supabase.rpc("daily_active_users", { target_date: targetDate }),
      supabase.rpc("daily_ai_cost_by_user", { target_date: targetDate }),
      supabase.from("profiles").select("id").eq("is_admin", true),
    ]);

    if (activeResp.error) throw new Error(`active users rpc: ${activeResp.error.message}`);
    if (costResp.error) throw new Error(`ai costs rpc: ${costResp.error.message}`);
    if (adminResp.error) throw new Error(`admins: ${adminResp.error.message}`);

    const admins = adminResp.data || [];
    const active = (activeResp.data || []) as ActiveUser[];
    const costs = (costResp.data || []) as CostRow[];

    const { subject, html } = renderEmail({ dateStr: targetDate, active, costs });

    let sent = 0;
    let errors = 0;
    for (const a of admins) {
      try {
        const { data: userRec } = await supabase.auth.admin.getUserById(a.id);
        const email = userRec?.user?.email;
        if (!email) {
          console.warn(`Admin ${a.id} has no email, skipping`);
          continue;
        }
        const result = await resend.emails.send({
          from: FROM_EMAIL,
          to: [email],
          subject,
          html,
        });
        if ((result as any).error) {
          console.error(`Admin send error for ${a.id}:`, (result as any).error);
          errors++;
        } else {
          sent++;
        }
      } catch (err: any) {
        console.error(`Admin ${a.id} failed:`, err);
        errors++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        admins: admins.length,
        sent,
        errors,
        activeUsers: active.length,
        costRows: costs.length,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("send-admin-daily-digest error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

serve(handler);
