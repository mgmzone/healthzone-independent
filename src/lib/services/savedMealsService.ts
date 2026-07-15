import { supabase } from "@/lib/supabase";
import { SavedMeal } from "@/lib/types";

type SavedMealRow = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  meal_slot: string | null;
  protein_grams: number | null;
  carbs_grams: number | null;
  fat_grams: number | null;
  sodium_mg: number | null;
  calories: number | null;
  anti_inflammatory: boolean | null;
  times_used: number | null;
  last_used_at: string | null;
};

function mapSavedMeal(row: SavedMealRow): SavedMeal {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description ?? undefined,
    mealSlot: row.meal_slot ?? undefined,
    proteinGrams: row.protein_grams ?? undefined,
    carbsGrams: row.carbs_grams ?? undefined,
    fatGrams: row.fat_grams ?? undefined,
    sodiumMg: row.sodium_mg ?? undefined,
    calories: row.calories ?? undefined,
    antiInflammatory: row.anti_inflammatory ?? false,
    timesUsed: row.times_used ?? 0,
    lastUsedAt: row.last_used_at ? new Date(row.last_used_at) : undefined,
  };
}

function toDbData(input: Partial<SavedMeal>): Record<string, unknown> {
  const dbData: Record<string, unknown> = {};
  if (input.name !== undefined) dbData.name = input.name;
  if (input.description !== undefined) dbData.description = input.description ?? null;
  if (input.mealSlot !== undefined) dbData.meal_slot = input.mealSlot ?? null;
  if (input.proteinGrams !== undefined) dbData.protein_grams = input.proteinGrams ?? null;
  if (input.carbsGrams !== undefined) dbData.carbs_grams = input.carbsGrams ?? null;
  if (input.fatGrams !== undefined) dbData.fat_grams = input.fatGrams ?? null;
  if (input.sodiumMg !== undefined) dbData.sodium_mg = input.sodiumMg ?? null;
  if (input.calories !== undefined) dbData.calories = input.calories ?? null;
  if (input.antiInflammatory !== undefined) dbData.anti_inflammatory = input.antiInflammatory;
  return dbData;
}

// Most-used first so favorites float to the top of the picker.
export async function getSavedMeals(): Promise<SavedMeal[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase
    .from('saved_meals')
    .select('*')
    .eq('user_id', session.user.id)
    .order('times_used', { ascending: false })
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching saved meals:', error);
    return [];
  }
  return (data as SavedMealRow[]).map(mapSavedMeal);
}

// Insert-or-update by (user_id, name): re-saving a favorite under the
// same name refreshes its description and macros.
export async function upsertSavedMeal(input: Partial<SavedMeal> & { name: string }): Promise<SavedMeal> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('saved_meals')
    .upsert(
      { user_id: session.user.id, ...toDbData(input), name: input.name },
      { onConflict: 'user_id,name' },
    )
    .select()
    .single();

  if (error) throw error;
  return mapSavedMeal(data as SavedMealRow);
}

export async function updateSavedMeal(id: string, input: Partial<SavedMeal>): Promise<SavedMeal> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('saved_meals')
    .update(toDbData(input))
    .eq('id', id)
    .eq('user_id', session.user.id)
    .select()
    .single();

  if (error) throw error;
  return mapSavedMeal(data as SavedMealRow);
}

export async function deleteSavedMeal(id: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('saved_meals')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id);
  if (error) throw error;
}

// Bump usage stats when a favorite is actually logged (drives the
// most-used-first ordering). Best-effort — failures are non-fatal.
export async function markSavedMealUsed(meal: SavedMeal): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  const { error } = await supabase
    .from('saved_meals')
    .update({ times_used: meal.timesUsed + 1, last_used_at: new Date().toISOString() })
    .eq('id', meal.id)
    .eq('user_id', session.user.id);
  if (error) console.error('Error updating saved meal usage:', error);
}
