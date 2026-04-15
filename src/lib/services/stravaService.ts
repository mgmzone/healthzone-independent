import { supabase } from "@/lib/supabase";

export interface StravaSyncResult {
  inserted: number;
  skipped: number;
  total: number;
}

export async function syncStrava(scope: 'today' | 'backfill' = 'today'): Promise<StravaSyncResult> {
  const { data, error } = await supabase.functions.invoke("strava-sync", {
    body: { scope },
  });
  if (error) throw new Error(error.message);
  if (!data?.success) throw new Error(data?.error || "Strava sync failed");
  return {
    inserted: data.inserted,
    skipped: data.skipped,
    total: data.total,
  };
}

export async function saveStravaCredentials(params: {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");
  const { error } = await supabase
    .from("profiles")
    .update({
      strava_client_id: params.clientId || null,
      strava_client_secret: params.clientSecret || null,
      strava_refresh_token: params.refreshToken || null,
    })
    .eq("id", session.user.id);
  if (error) throw error;
}

export async function getStravaStatus(): Promise<{ connected: boolean; lastSyncAt: string | null }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { connected: false, lastSyncAt: null };
  const { data, error } = await supabase
    .from("profiles")
    .select("strava_client_id, strava_refresh_token, strava_last_sync_at")
    .eq("id", session.user.id)
    .single();
  if (error || !data) return { connected: false, lastSyncAt: null };
  return {
    connected: Boolean(data.strava_client_id && data.strava_refresh_token),
    lastSyncAt: data.strava_last_sync_at,
  };
}
