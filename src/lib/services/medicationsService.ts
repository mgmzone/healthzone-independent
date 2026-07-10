import { supabase } from "@/lib/supabase";
import { Medication, MedicationLog, MedicationLogStatus } from "@/lib/types";

// ============================================================
// Medications (definitions)
// ============================================================

type MedicationRow = {
  id: string;
  user_id: string;
  name: string;
  dose: string | null;
  schedule: string | null;
  times_per_day: number | null;
  slots: string[] | null;
  is_prn: boolean | null;
  max_per_day: number | null;
  min_hours_between: number | null;
  notes: string | null;
  is_active: boolean;
  sort_order: number;
};

function mapMedication(row: MedicationRow): Medication {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    dose: row.dose ?? undefined,
    schedule: row.schedule ?? undefined,
    timesPerDay: row.times_per_day ?? undefined,
    slots: row.slots ?? [],
    isPrn: row.is_prn ?? false,
    maxPerDay: row.max_per_day ?? undefined,
    minHoursBetween: row.min_hours_between ?? undefined,
    notes: row.notes ?? undefined,
    isActive: row.is_active,
    sortOrder: row.sort_order,
  };
}

export async function getMedications(includeInactive = false): Promise<Medication[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  let query = supabase
    .from('medications')
    .select('*')
    .eq('user_id', session.user.id)
    .order('sort_order', { ascending: true });
  if (!includeInactive) query = query.eq('is_active', true);

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching medications:', error);
    return [];
  }
  return (data as MedicationRow[]).map(mapMedication);
}

export async function addMedication(input: Partial<Medication>): Promise<Medication> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('medications')
    .insert({
      user_id: session.user.id,
      name: input.name ?? '',
      dose: input.dose ?? null,
      schedule: input.schedule ?? null,
      times_per_day: input.timesPerDay ?? null,
      slots: input.slots ?? [],
      is_prn: input.isPrn ?? false,
      max_per_day: input.maxPerDay ?? null,
      min_hours_between: input.minHoursBetween ?? null,
      notes: input.notes ?? null,
      is_active: input.isActive ?? true,
      sort_order: input.sortOrder ?? 0,
    })
    .select()
    .single();

  if (error) throw error;
  return mapMedication(data as MedicationRow);
}

export async function updateMedication(id: string, input: Partial<Medication>): Promise<Medication> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.dose !== undefined) patch.dose = input.dose;
  if (input.schedule !== undefined) patch.schedule = input.schedule;
  if (input.timesPerDay !== undefined) patch.times_per_day = input.timesPerDay;
  if (input.slots !== undefined) patch.slots = input.slots;
  if (input.isPrn !== undefined) patch.is_prn = input.isPrn;
  if (input.maxPerDay !== undefined) patch.max_per_day = input.maxPerDay;
  if (input.minHoursBetween !== undefined) patch.min_hours_between = input.minHoursBetween;
  if (input.notes !== undefined) patch.notes = input.notes;
  if (input.isActive !== undefined) patch.is_active = input.isActive;
  if (input.sortOrder !== undefined) patch.sort_order = input.sortOrder;

  const { data, error } = await supabase
    .from('medications')
    .update(patch)
    .eq('id', id)
    .eq('user_id', session.user.id)
    .select()
    .single();

  if (error) throw error;
  return mapMedication(data as MedicationRow);
}

export async function deleteMedication(id: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('medications')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id);
  if (error) throw error;
}

// ============================================================
// Medication logs (doses taken/skipped)
// ============================================================

type MedicationLogRow = {
  id: string;
  user_id: string;
  medication_id: string | null;
  medication_name: string | null;
  taken_at: string;
  slot: string | null;
  status: string;
  notes: string | null;
};

function mapMedicationLog(row: MedicationLogRow): MedicationLog {
  return {
    id: row.id,
    userId: row.user_id,
    medicationId: row.medication_id ?? undefined,
    medicationName: row.medication_name ?? undefined,
    takenAt: new Date(row.taken_at),
    slot: row.slot ?? undefined,
    status: (row.status as MedicationLogStatus) ?? 'taken',
    notes: row.notes ?? undefined,
  };
}

export async function logMedication(input: {
  medication: Medication;
  slot?: string;
  status?: MedicationLogStatus;
  takenAt?: Date;
  notes?: string;
}): Promise<MedicationLog> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('medication_logs')
    .insert({
      user_id: session.user.id,
      medication_id: input.medication.id,
      medication_name: input.medication.name,
      taken_at: (input.takenAt ?? new Date()).toISOString(),
      slot: input.slot ?? (input.medication.isPrn ? 'prn' : null),
      status: input.status ?? 'taken',
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return mapMedicationLog(data as MedicationLogRow);
}

export async function deleteMedicationLog(id: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('medication_logs')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id);
  if (error) throw error;
}

// Medication logs within an inclusive range [start, end].
export async function getMedicationLogs(start: Date, end: Date): Promise<MedicationLog[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase
    .from('medication_logs')
    .select('*')
    .eq('user_id', session.user.id)
    .gte('taken_at', start.toISOString())
    .lte('taken_at', end.toISOString())
    .order('taken_at', { ascending: false });

  if (error) {
    console.error('Error fetching medication logs:', error);
    return [];
  }
  return (data as MedicationLogRow[]).map(mapMedicationLog);
}
