import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, serviceKey);

function buildCorsHeaders(req: Request) {
  const allowed = (Deno.env.get("ALLOWED_ORIGIN") || "http://localhost:8080,http://localhost:5173,http://localhost:8081").split(",").map(s => s.trim());
  const reqOrigin = req.headers.get("Origin") || "";
  const originToUse = allowed.includes(reqOrigin) ? reqOrigin : allowed[0] || "*";
  return {
    "Access-Control-Allow-Origin": originToUse,
    "Vary": "Origin",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  } as Record<string, string>;
}

// Strava activity type → our enum
function mapType(stravaType: string): 'walk' | 'run' | 'bike' | 'elliptical' | 'other' {
  const t = (stravaType || '').toLowerCase();
  if (t === 'walk' || t === 'hike') return 'walk';
  if (t === 'run' || t === 'trailrun' || t === 'virtualrun') return 'run';
  if (t === 'ride' || t === 'virtualride' || t === 'ebikeride' || t === 'mountainbikeride' || t === 'gravelride') return 'bike';
  if (t === 'elliptical') return 'elliptical';
  return 'other';
}

// Rough intensity from HR + suffer score. Falls back to "medium".
function mapIntensity(avgHr: number | null | undefined, sufferScore: number | null | undefined): 'low' | 'medium' | 'high' {
  if (typeof sufferScore === 'number') {
    if (sufferScore >= 100) return 'high';
    if (sufferScore < 40) return 'low';
    return 'medium';
  }
  if (typeof avgHr === 'number' && avgHr > 0) {
    if (avgHr >= 150) return 'high';
    if (avgHr < 120) return 'low';
    return 'medium';
  }
  return 'medium';
}

class StravaAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StravaAuthError";
  }
}

async function refreshAccessToken(clientId: string, clientSecret: string, refreshToken: string): Promise<{ accessToken: string; newRefreshToken: string }> {
  const body = new URLSearchParams({
    client_id: String(clientId),
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (res.status === 401 || res.status === 400) {
    const responseBody = await res.text();
    throw new StravaAuthError(`Strava rejected the refresh token: ${responseBody}`);
  }
  if (!res.ok) {
    const responseBody = await res.text();
    throw new Error(`Strava token refresh failed: ${res.status} ${responseBody}`);
  }
  const json = await res.json();
  return {
    accessToken: json.access_token as string,
    newRefreshToken: (json.refresh_token as string) || refreshToken,
  };
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

    const { scope } = await req.json().catch(() => ({ scope: "today" }));
    const userId = user.id;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("strava_client_id, strava_client_secret, strava_refresh_token")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ success: false, error: "Could not load profile" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
      });
    }

    if (!profile.strava_client_id || !profile.strava_client_secret || !profile.strava_refresh_token) {
      return new Response(JSON.stringify({ success: false, error: "Strava not configured. Add credentials in Profile > Integrations." }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
      });
    }

    // Refresh access token. If Strava rejects the credentials, clear the stored
    // refresh_token so the UI reflects a disconnected state and prompts reconnect.
    let accessToken: string;
    let newRefreshToken: string;
    try {
      const refreshed = await refreshAccessToken(
        profile.strava_client_id,
        profile.strava_client_secret,
        profile.strava_refresh_token,
      );
      accessToken = refreshed.accessToken;
      newRefreshToken = refreshed.newRefreshToken;
    } catch (err) {
      if (err instanceof StravaAuthError) {
        await supabase.from("profiles").update({ strava_refresh_token: null }).eq("id", userId);
        return new Response(JSON.stringify({
          success: false,
          error: "Strava refresh token is invalid. Reconnect Strava in Profile > Integrations.",
          reconnectRequired: true,
        }), {
          status: 401,
          headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
        });
      }
      throw err;
    }

    // Persist new refresh token if Strava rotated it
    if (newRefreshToken !== profile.strava_refresh_token) {
      await supabase.from("profiles").update({ strava_refresh_token: newRefreshToken }).eq("id", userId);
    }

    // Range: default to today (local day, approximated as UTC midnight)
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const afterEpoch = scope === "today"
      ? Math.floor(startOfDay.getTime() / 1000)
      : Math.floor((now.getTime() - 30 * 86400000) / 1000); // 30-day backfill for any other scope

    const activitiesRes = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?after=${afterEpoch}&per_page=50`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!activitiesRes.ok) {
      const body = await activitiesRes.text();
      return new Response(JSON.stringify({ success: false, error: `Strava API error: ${activitiesRes.status} ${body}` }), {
        status: 502,
        headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
      });
    }
    const activities = await activitiesRes.json() as any[];

    let inserted = 0;
    let skipped = 0;

    for (const act of activities) {
      const rowDate = new Date(act.start_date_local || act.start_date).toISOString().split("T")[0];
      const minutes = Math.round((act.moving_time || 0) / 60);
      if (minutes === 0) { skipped++; continue; }

      const row: any = {
        user_id: userId,
        date: rowDate,
        type: mapType(act.type || act.sport_type),
        minutes,
        intensity: mapIntensity(act.average_heartrate, act.suffer_score),
        distance: act.distance ? act.distance / 1000 : null, // meters → km
        average_heart_rate: act.average_heartrate ? Math.round(act.average_heartrate) : null,
        highest_heart_rate: act.max_heartrate ? Math.round(act.max_heartrate) : null,
        strava_activity_id: act.id,
      };

      const { error: insertError } = await supabase
        .from("exercise_logs")
        .insert(row);

      if (insertError) {
        // Unique violation on (user_id, strava_activity_id) means already synced — expected
        if ((insertError as any).code === '23505') {
          skipped++;
        } else {
          console.error("Insert error:", insertError);
        }
      } else {
        inserted++;
      }
    }

    await supabase.from("profiles").update({ strava_last_sync_at: new Date().toISOString() }).eq("id", userId);

    return new Response(JSON.stringify({
      success: true,
      inserted,
      skipped,
      total: activities.length,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
    });
  } catch (error: any) {
    console.error("strava-sync error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
    });
  }
};

serve(handler);
