import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { buildCorsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, serviceKey);

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

    const { code } = await req.json().catch(() => ({ code: null }));
    if (!code || typeof code !== "string") {
      return new Response(JSON.stringify({ success: false, error: "Missing authorization code" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
      });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("strava_client_id, strava_client_secret")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ success: false, error: "Could not load profile" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
      });
    }

    if (!profile.strava_client_id || !profile.strava_client_secret) {
      return new Response(JSON.stringify({ success: false, error: "Save your Client ID and Client Secret before connecting." }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
      });
    }

    const body = new URLSearchParams({
      client_id: String(profile.strava_client_id),
      client_secret: profile.strava_client_secret,
      code,
      grant_type: "authorization_code",
    });

    const tokenRes = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const tokenBody = await tokenRes.text();
    if (!tokenRes.ok) {
      // Log the upstream detail server-side; return a fixed message to the client
      // so we don't leak whatever Strava decides to include in error payloads.
      console.error("Strava token exchange failed:", tokenRes.status, tokenBody);
      return new Response(JSON.stringify({
        success: false,
        error: "Strava rejected the authorization code. Click Connect Strava again — codes are single-use and expire quickly.",
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
      });
    }

    let parsed: any;
    try {
      parsed = JSON.parse(tokenBody);
    } catch {
      return new Response(JSON.stringify({ success: false, error: "Could not parse Strava response" }), {
        status: 502,
        headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
      });
    }

    const refreshToken = parsed.refresh_token;
    if (!refreshToken) {
      return new Response(JSON.stringify({ success: false, error: "Strava response did not include a refresh token" }), {
        status: 502,
        headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
      });
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ strava_refresh_token: refreshToken })
      .eq("id", user.id);

    if (updateError) {
      console.error("Failed to save refresh_token:", updateError);
      return new Response(JSON.stringify({ success: false, error: "Failed to save refresh token" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      scope: parsed.scope || null,
      athleteId: parsed.athlete?.id || null,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
    });
  } catch (error: any) {
    console.error("strava-oauth-exchange error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
    });
  }
};

serve(handler);
