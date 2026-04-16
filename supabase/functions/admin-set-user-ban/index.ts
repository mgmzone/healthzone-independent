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

// Indefinite ban duration — Supabase expects a Go-style duration string.
// ~100 years is effectively forever; unban with "none".
const FOREVER = "876000h";

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

    // Caller must be admin per profiles.is_admin.
    const { data: caller, error: callerError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    if (callerError || !caller?.is_admin) {
      return new Response(JSON.stringify({ success: false, error: "Admin only" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
      });
    }

    const { userId, action } = await req.json().catch(() => ({ userId: null, action: null }));
    if (!userId || typeof userId !== "string") {
      return new Response(JSON.stringify({ success: false, error: "Missing userId" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
      });
    }
    if (action !== "suspend" && action !== "reactivate") {
      return new Response(JSON.stringify({ success: false, error: "action must be 'suspend' or 'reactivate'" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
      });
    }
    if (userId === user.id) {
      return new Response(JSON.stringify({ success: false, error: "Cannot suspend your own account" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
      });
    }

    const banDuration = action === "suspend" ? FOREVER : "none";
    const { error: banError } = await supabase.auth.admin.updateUserById(userId, {
      ban_duration: banDuration,
    } as any);

    if (banError) {
      console.error("Ban update failed:", banError);
      return new Response(JSON.stringify({ success: false, error: "Failed to update user" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
      });
    }

    return new Response(JSON.stringify({ success: true, action }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
    });
  } catch (error: any) {
    console.error("admin-set-user-ban error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
    });
  }
};

serve(handler);
