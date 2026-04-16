import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, serviceKey);

type EmailCategory = "weekly" | "system";

const TYPE_COLUMN: Record<EmailCategory, string> = {
  weekly: "weekly_summary_emails",
  system: "system_notification_emails",
};

const TYPE_LABEL: Record<EmailCategory, string> = {
  weekly: "weekly summary",
  system: "system notification",
};

function htmlPage(title: string, body: string): Response {
  return new Response(
    `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f9fafb; color: #1f2937; margin: 0; padding: 40px 20px; }
  .card { max-width: 440px; margin: 0 auto; background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 32px; text-align: center; }
  h1 { margin: 0 0 12px; font-size: 22px; color: #111827; }
  p { margin: 0 0 12px; font-size: 14px; color: #4b5563; line-height: 1.5; }
  .muted { font-size: 12px; color: #9ca3af; margin-top: 20px; }
</style>
</head><body><div class="card">${body}</div></body></html>`,
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const typeRaw = (url.searchParams.get("type") || "weekly").toLowerCase();
    const type = (typeRaw === "system" ? "system" : "weekly") as EmailCategory;

    if (!token) {
      return htmlPage(
        "Invalid unsubscribe link",
        `<h1>Invalid link</h1><p>This unsubscribe link is missing its token. Log in and manage your email preferences in Profile.</p>`
      );
    }

    const { data: profile, error: findError } = await supabase
      .from("profiles")
      .select("id, first_name")
      .eq("email_unsubscribe_token", token)
      .maybeSingle();

    if (findError || !profile) {
      return htmlPage(
        "Link expired",
        `<h1>Link expired or unrecognized</h1><p>This unsubscribe link is no longer valid. Log in and manage your email preferences in Profile.</p>`
      );
    }

    const column = TYPE_COLUMN[type];
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ [column]: false })
      .eq("id", profile.id);

    if (updateError) {
      console.error("Unsubscribe update failed:", updateError);
      return htmlPage(
        "Could not unsubscribe",
        `<h1>Something went wrong</h1><p>Please try again or log in to manage your preferences.</p>`
      );
    }

    return htmlPage(
      "Unsubscribed",
      `<h1>You're unsubscribed</h1>
      <p>${profile.first_name ? profile.first_name + ',' : 'You'} will no longer receive <strong>${TYPE_LABEL[type]}</strong> emails from HealthZone.</p>
      <p class="muted">Re-enable anytime from Profile → Email preferences.</p>`
    );
  } catch (error: any) {
    console.error("unsubscribe-email error:", error);
    return htmlPage(
      "Error",
      `<h1>Something went wrong</h1><p>Please try again later.</p>`
    );
  }
});
