import { supabase } from "@/lib/supabase";
import { MealLog, ProteinSource } from "@/lib/types";
import { getCurrentPeriodRange } from '@/lib/services/periodsService';
import { toLocalDateString } from '@/lib/utils/dateUtils';

// ============================================================
// Meal Logs
// ============================================================

export async function getMealLogs() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const period = await getCurrentPeriodRange();
  if (!period?.start) return [];

  let query = supabase
    .from('meal_logs')
    .select('*')
    .eq('user_id', session.user.id)
    .order('date', { ascending: false });

  if (period?.start) {
    query = query.gte('date', period.start);
  }
  if (period?.end) {
    query = query.lte('date', period.end);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching meal logs:', error);
    return [];
  }

  return data.map(item => ({
    id: item.id,
    userId: item.user_id,
    date: new Date(item.date + 'T12:00:00'),
    mealSlot: item.meal_slot,
    proteinGrams: item.protein_grams || undefined,
    proteinSource: item.protein_source || undefined,
    irritantViolation: item.irritant_violation,
    irritantNotes: item.irritant_notes || undefined,
    antiInflammatory: item.anti_inflammatory,
    notes: item.notes || undefined,
  }));
}

export async function addMealLog(mealData: Partial<MealLog>) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const period = await getCurrentPeriodRange();
  if (!period) throw new Error('No active period. Create a period before adding data.');

  const dateStr = mealData.date
    ? toLocalDateString(mealData.date)
    : toLocalDateString(new Date());

  const dbData = {
    user_id: session.user.id,
    date: dateStr,
    meal_slot: mealData.mealSlot || 'noon',
    protein_grams: mealData.proteinGrams,
    protein_source: mealData.proteinSource,
    irritant_violation: mealData.irritantViolation || false,
    irritant_notes: mealData.irritantNotes,
    anti_inflammatory: mealData.antiInflammatory || false,
    notes: mealData.notes,
  };

  const { data, error } = await supabase
    .from('meal_logs')
    .insert(dbData)
    .select()
    .single();

  if (error) {
    console.error('Error adding meal log:', error);
    throw error;
  }

  return {
    id: data.id,
    userId: data.user_id,
    date: new Date(data.date),
    mealSlot: data.meal_slot as 'noon' | 'afternoon' | 'evening',
    proteinGrams: data.protein_grams || undefined,
    proteinSource: data.protein_source || undefined,
    irritantViolation: data.irritant_violation,
    irritantNotes: data.irritant_notes || undefined,
    antiInflammatory: data.anti_inflammatory,
    notes: data.notes || undefined,
  };
}

export async function updateMealLog(id: string, mealData: Partial<MealLog>) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const dbData: Record<string, any> = {};

  if (mealData.date) {
    dbData.date = toLocalDateString(mealData.date);
  }
  if (mealData.mealSlot !== undefined) dbData.meal_slot = mealData.mealSlot;
  if (mealData.proteinGrams !== undefined) dbData.protein_grams = mealData.proteinGrams;
  if (mealData.proteinSource !== undefined) dbData.protein_source = mealData.proteinSource;
  if (mealData.irritantViolation !== undefined) dbData.irritant_violation = mealData.irritantViolation;
  if (mealData.irritantNotes !== undefined) dbData.irritant_notes = mealData.irritantNotes;
  if (mealData.antiInflammatory !== undefined) dbData.anti_inflammatory = mealData.antiInflammatory;
  if (mealData.notes !== undefined) dbData.notes = mealData.notes;

  const { data, error } = await supabase
    .from('meal_logs')
    .update(dbData)
    .eq('id', id)
    .eq('user_id', session.user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating meal log:', error);
    throw error;
  }

  return {
    id: data.id,
    userId: data.user_id,
    date: new Date(data.date),
    mealSlot: data.meal_slot as 'noon' | 'afternoon' | 'evening',
    proteinGrams: data.protein_grams || undefined,
    proteinSource: data.protein_source || undefined,
    irritantViolation: data.irritant_violation,
    irritantNotes: data.irritant_notes || undefined,
    antiInflammatory: data.anti_inflammatory,
    notes: data.notes || undefined,
  };
}

export async function deleteMealLog(id: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('meal_logs')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id);

  if (error) {
    console.error('Error deleting meal log:', error);
    throw error;
  }

  return true;
}

// ============================================================
// Protein Sources
// ============================================================

export async function getProteinSources() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase
    .from('protein_sources')
    .select('*')
    .eq('user_id', session.user.id)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching protein sources:', error);
    return [];
  }

  return data.map(item => ({
    id: item.id,
    userId: item.user_id,
    name: item.name,
    typicalProteinGrams: item.typical_protein_grams || undefined,
    isAntiInflammatory: item.is_anti_inflammatory,
    sortOrder: item.sort_order,
  }));
}

export async function addProteinSource(sourceData: Partial<ProteinSource>) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const dbData = {
    user_id: session.user.id,
    name: sourceData.name || '',
    typical_protein_grams: sourceData.typicalProteinGrams,
    is_anti_inflammatory: sourceData.isAntiInflammatory || false,
    sort_order: sourceData.sortOrder || 0,
  };

  const { data, error } = await supabase
    .from('protein_sources')
    .insert(dbData)
    .select()
    .single();

  if (error) {
    console.error('Error adding protein source:', error);
    throw error;
  }

  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    typicalProteinGrams: data.typical_protein_grams || undefined,
    isAntiInflammatory: data.is_anti_inflammatory,
    sortOrder: data.sort_order,
  };
}

export async function updateProteinSource(id: string, sourceData: Partial<ProteinSource>) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const dbData: Record<string, any> = {};
  if (sourceData.name !== undefined) dbData.name = sourceData.name;
  if (sourceData.typicalProteinGrams !== undefined) dbData.typical_protein_grams = sourceData.typicalProteinGrams;
  if (sourceData.isAntiInflammatory !== undefined) dbData.is_anti_inflammatory = sourceData.isAntiInflammatory;
  if (sourceData.sortOrder !== undefined) dbData.sort_order = sourceData.sortOrder;

  const { data, error } = await supabase
    .from('protein_sources')
    .update(dbData)
    .eq('id', id)
    .eq('user_id', session.user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating protein source:', error);
    throw error;
  }

  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    typicalProteinGrams: data.typical_protein_grams || undefined,
    isAntiInflammatory: data.is_anti_inflammatory,
    sortOrder: data.sort_order,
  };
}

export async function deleteProteinSource(id: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('protein_sources')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id);

  if (error) {
    console.error('Error deleting protein source:', error);
    throw error;
  }

  return true;
}
