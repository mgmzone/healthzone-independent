import { supabase } from '@/lib/supabase';

export type PeriodRange = { start: string; end?: string } | null;
export type PeriodInfo = { id: string; start: string; end?: string } | null;

// Short-lived in-memory cache of the current active period. One Dashboard mount
// fans out ~6 identical "current period" lookups across the weight/meal/exercise/
// fasting services; without this each is a separate Supabase round trip. The TTL
// is deliberately short, and every period create/update/delete calls
// invalidateCurrentPeriodCache() so a freshly changed period is picked up at once.
type CachedPeriod = { userId: string; value: PeriodInfo; expires: number };
let periodCache: CachedPeriod | null = null;
let inFlight: Promise<PeriodInfo> | null = null;
const PERIOD_CACHE_TTL_MS = 15_000;

export function invalidateCurrentPeriodCache(): void {
  periodCache = null;
  inFlight = null;
}

async function fetchCurrentPeriod(): Promise<PeriodInfo> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const userId = session.user.id;
  if (periodCache && periodCache.userId === userId && periodCache.expires > Date.now()) {
    return periodCache.value;
  }
  // Coalesce the concurrent Dashboard fan-out onto a single in-flight query.
  if (inFlight) return inFlight;

  inFlight = (async () => {
    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from('periods')
      .select('id, start_date, end_date')
      .eq('user_id', userId)
      .lte('start_date', nowIso)
      .or('end_date.is.null,end_date.gte.' + nowIso)
      .order('start_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching current period:', error);
      return null;
    }

    const value: PeriodInfo = data
      ? {
          id: data.id,
          // Truncate to date-only so filtering uses day granularity, not the exact
          // period creation timestamp (which would exclude same-day earlier entries).
          start: data.start_date.split('T')[0],
          end: data.end_date || undefined,
        }
      : null;

    periodCache = { userId, value, expires: Date.now() + PERIOD_CACHE_TTL_MS };
    return value;
  })();

  try {
    return await inFlight;
  } finally {
    inFlight = null;
  }
}

// Fetch the current active period date range for the signed-in user.
export async function getCurrentPeriodRange(): Promise<PeriodRange> {
  const info = await fetchCurrentPeriod();
  return info ? { start: info.start, end: info.end } : null;
}

// Fetch the current active period with its id for the signed-in user.
export async function getCurrentPeriodInfo(): Promise<PeriodInfo> {
  return fetchCurrentPeriod();
}
