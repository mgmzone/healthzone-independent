import { supabase } from '@/lib/supabase';

export type PeriodRange = { start: string; end?: string } | null;

// Fetch the current active period date range for the signed-in user
export async function getCurrentPeriodRange(): Promise<PeriodRange> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('periods')
    .select('start_date, end_date')
    .eq('user_id', session.user.id)
    .lte('start_date', nowIso)
    .or('end_date.is.null,end_date.gte.' + nowIso)
    .order('start_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching current period range:', error);
    return null;
  }

  if (!data) return null;

  return {
    start: data.start_date,
    end: data.end_date || undefined,
  };
}

export type PeriodInfo = { id: string; start: string; end?: string } | null;

// Fetch the current active period with id for the signed-in user
export async function getCurrentPeriodInfo(): Promise<PeriodInfo> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('periods')
    .select('id, start_date, end_date')
    .eq('user_id', session.user.id)
    .lte('start_date', nowIso)
    .or('end_date.is.null,end_date.gte.' + nowIso)
    .order('start_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching current period info:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    start: data.start_date,
    end: data.end_date || undefined,
  };
}
