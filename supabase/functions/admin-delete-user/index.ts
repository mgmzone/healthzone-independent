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

// Deletes a user and every trace of their data. Callable by admins (to remove
// any user but themselves) or by a user to delete their own account.
// Relies on CASCADE FKs from auth.users → profiles → all user-owned tables.
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

    const body = await req.json().catch(() => ({ userId: null, mode: null, confirmEmail: null }));
    const { userId, mode, confirmEmail } = body as {
      userId?: string;
      mode?: "admin" | "self";
      confirmEmail?: string;
    };

    if (mode !== "admin" && mode !== "self") {
      return new Response(JSON.stringify({ success: false, error: "mode must be 'admin' or 'self'" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
      });
    }

    let targetUserId: string;
    if (mode === "self") {
      // User deleting themselves. Require email confirmation typed in the UI.
      targetUserId = user.id;
      if (!confirmEmail || confirmEmail.toLowerCase().trim() !== (user.email || "").toLowerCase().trim()) {
        return new Response(JSON.stringify({ success: false, error: "Email confirmation did not match" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
        });
      }
    } else {
      // Admin deleting another user. Verify admin, reject self-delete through admin path.
      if (!userId || typeof userId !== "string") {
        return new Response(JSON.stringify({ success: false, error: "Missing userId" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
        });
      }
      if (userId === user.id) {
        return new Response(JSON.stringify({ success: false, error: "Admin cannot delete their own account via admin path. Use Delete My Account in Profile." }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
        });
      }
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
      // Require the admin to type the target user's email to confirm.
      const { data: targetUser, error: targetError } = await supabase.auth.admin.getUserById(userId);
      if (targetError || !targetUser?.user) {
        return new Response(JSON.stringify({ success: false, error: "Target user not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
        });
      }
      const expected = (targetUser.user.email || "").toLowerCase().trim();
      if (!confirmEmail || confirmEmail.toLowerCase().trim() !== expected) {
        return new Response(JSON.stringify({ success: false, error: "Email confirmation did not match target user" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
        });
      }
      targetUserId = userId;
    }

    const { error: deleteError } = await supabase.auth.admin.deleteUser(targetUserId);
    if (deleteError) {
      console.error("deleteUser failed:", deleteError);
      return new Response(JSON.stringify({ success: false, error: "Failed to delete user" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
    });
  } catch (error: any) {
    console.error("admin-delete-user error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...buildCorsHeaders(req) },
    });
  }
};

serve(handler);
