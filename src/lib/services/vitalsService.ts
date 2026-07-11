import { supabase } from "@/lib/supabase";
import { Vitals } from "@/lib/types";

type VitalsRow = {
  id: string;
  user_id: string;
  measured_at: string;
  systolic: number | null;
  diastolic: number | null;
  pulse: number | null;
  oxygen_saturation: number | null;
  temperature: number | null;
  temperature_unit: string;
  respiratory_rate: number | null;
  blood_glucose: number | null;
  notes: string | null;
};

function mapVitals(row: VitalsRow): Vitals {
  return {
    id: row.id,
    userId: row.user_id,
    measuredAt: new Date(row.measured_at),
    systolic: row.systolic ?? undefined,
    diastolic: row.diastolic ?? undefined,
    pulse: row.pulse ?? undefined,
    oxygenSaturation: row.oxygen_saturation ?? undefined,
    temperature: row.temperature ?? undefined,
    temperatureUnit: (row.temperature_unit as 'F' | 'C') ?? 'F',
    respiratoryRate: row.respiratory_rate ?? undefined,
    bloodGlucose: row.blood_glucose ?? undefined,
    notes: row.notes ?? undefined,
  };
}

export async function getVitals(limit = 100): Promise<Vitals[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase
    .from('vitals')
    .select('*')
    .eq('user_id', session.user.id)
    .order('measured_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching vitals:', error);
    return [];
  }
  return (data as VitalsRow[]).map(mapVitals);
}

export async function getVitalsInRange(start: Date, end: Date): Promise<Vitals[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase
    .from('vitals')
    .select('*')
    .eq('user_id', session.user.id)
    .gte('measured_at', start.toISOString())
    .lte('measured_at', end.toISOString())
    .order('measured_at', { ascending: true });

  if (error) {
    console.error('Error fetching vitals range:', error);
    return [];
  }
  return (data as VitalsRow[]).map(mapVitals);
}

export async function addVitals(input: Partial<Vitals>): Promise<Vitals> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('vitals')
    .insert({
      user_id: session.user.id,
      measured_at: (input.measuredAt ?? new Date()).toISOString(),
      systolic: input.systolic ?? null,
      diastolic: input.diastolic ?? null,
      pulse: input.pulse ?? null,
      oxygen_saturation: input.oxygenSaturation ?? null,
      temperature: input.temperature ?? null,
      temperature_unit: input.temperatureUnit ?? 'F',
      respiratory_rate: input.respiratoryRate ?? null,
      blood_glucose: input.bloodGlucose ?? null,
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return mapVitals(data as VitalsRow);
}

export async function updateVitalsTime(id: string, measuredAt: Date): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('vitals')
    .update({ measured_at: measuredAt.toISOString() })
    .eq('id', id)
    .eq('user_id', session.user.id);
  if (error) throw error;
}

export async function deleteVitals(id: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('vitals')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id);
  if (error) throw error;
}
