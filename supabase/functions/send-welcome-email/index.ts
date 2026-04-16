import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "npm:resend@2.0.0";

// Event-driven welcome email. Invoked by the handle_new_user trigger via
// pg_net when a new auth.users row is inserted. Rate-limited via
// profiles.welcome_email_sent_at so re-confirmation events don't re-send.

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

    const { userId } = await req.json().catch(() => ({ userId: null }));
    if (!userId || typeof userId !== "string") {
      return new Response(JSON.stringify({ success: false, error: "Missing userId" }), {
        status: 400, headers: { "Content-Type": "application/json" },
      });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, first_name, welcome_email_sent_at, email_unsubscribe_token, system_notification_emails")
      .eq("id", userId)
      .single();
    if (profileError || !profile) {
      return new Response(JSON.stringify({ success: false, error: "Profile not found" }), {
        status: 404, headers: { "Content-Type": "application/json" },
      });
    }

    if (profile.welcome_email_sent_at) {
      return new Response(JSON.stringify({ success: true, skipped: "already sent" }), {
        status: 200, headers: { "Content-Type": "application/json" },
      });
    }

    // Respect system-email preference (defaults to true for new users).
    if (profile.system_notification_emails === false) {
      return new Response(JSON.stringify({ success: true, skipped: "opted out" }), {
        status: 200, headers: { "Content-Type": "application/json" },
      });
    }

    const { data: authUser, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError || !authUser.user?.email) {
      return new Response(JSON.stringify({ success: false, error: "Email not found" }), {
        status: 404, headers: { "Content-Type": "application/json" },
      });
    }

    const { data: template } = await supabase
      .from("email_templates")
      .select("subject, html_content")
      .eq("type", "welcome")
      .eq("is_active", true)
      .maybeSingle();
    if (!template) {
      return new Response(JSON.stringify({ success: false, error: "No active welcome template" }), {
        status: 500, headers: { "Content-Type": "application/json" },
      });
    }

    const placeholders: Record<string, string> = {
      name: profile.first_name || "there",
      appUrl: APP_URL,
      unsubscribeUrl: `${supabaseUrl}/functions/v1/unsubscribe-email?token=${encodeURIComponent(profile.email_unsubscribe_token || "")}&type=system`,
    };

    await resend.emails.send({
      from: FROM_EMAIL,
      to: [authUser.user.email],
      subject: replaceAll(template.subject, placeholders),
      html: replaceAll(template.html_content, placeholders),
    });

    await supabase.from("profiles").update({ welcome_email_sent_at: new Date().toISOString() }).eq("id", userId);

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("send-welcome-email error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }
};

serve(handler);
