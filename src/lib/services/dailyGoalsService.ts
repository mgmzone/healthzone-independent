import { supabase } from "@/lib/supabase";
import { DailyGoal, DailyGoalEntry } from "@/lib/types";
import { toLocalDateString } from '@/lib/utils/dateUtils';

// ============================================================
// Daily Goals (definitions)
// ============================================================

export async function getDailyGoals() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase
    .from('daily_goals')
    .select('*')
    .eq('user_id', session.user.id)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching daily goals:', error);
    return [];
  }

  return data.map(item => ({
    id: item.id,
    userId: item.user_id,
    name: item.name,
    description: item.description || undefined,
    category: item.category as DailyGoal['category'],
    sortOrder: item.sort_order,
    isActive: item.is_active,
  }));
}

export async function addDailyGoal(goalData: Partial<DailyGoal>) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const dbData = {
    user_id: session.user.id,
    name: goalData.name || '',
    description: goalData.description,
    category: goalData.category || 'dietary',
    sort_order: goalData.sortOrder || 0,
    is_active: goalData.isActive !== undefined ? goalData.isActive : true,
  };

  const { data, error } = await supabase
    .from('daily_goals')
    .insert(dbData)
    .select()
    .single();

  if (error) {
    console.error('Error adding daily goal:', error);
    throw error;
  }

  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    description: data.description || undefined,
    category: data.category as DailyGoal['category'],
    sortOrder: data.sort_order,
    isActive: data.is_active,
  };
}

export async function updateDailyGoal(id: string, goalData: Partial<DailyGoal>) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const dbData: Record<string, any> = {};
  if (goalData.name !== undefined) dbData.name = goalData.name;
  if (goalData.description !== undefined) dbData.description = goalData.description;
  if (goalData.category !== undefined) dbData.category = goalData.category;
  if (goalData.sortOrder !== undefined) dbData.sort_order = goalData.sortOrder;
  if (goalData.isActive !== undefined) dbData.is_active = goalData.isActive;

  const { data, error } = await supabase
    .from('daily_goals')
    .update(dbData)
    .eq('id', id)
    .eq('user_id', session.user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating daily goal:', error);
    throw error;
  }

  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    description: data.description || undefined,
    category: data.category as DailyGoal['category'],
    sortOrder: data.sort_order,
    isActive: data.is_active,
  };
}

export async function deleteDailyGoal(id: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('daily_goals')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id);

  if (error) {
    console.error('Error deleting daily goal:', error);
    throw error;
  }

  return true;
}

// ============================================================
// Daily Goal Entries (check-ins)
// ============================================================

export async function getDailyGoalEntries(startDate?: string, endDate?: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  let query = supabase
    .from('daily_goal_entries')
    .select('*')
    .eq('user_id', session.user.id)
    .order('date', { ascending: false });

  if (startDate) {
    query = query.gte('date', startDate);
  }
  if (endDate) {
    query = query.lte('date', endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching goal entries:', error);
    return [];
  }

  return data.map(item => ({
    id: item.id,
    userId: item.user_id,
    goalId: item.goal_id,
    date: new Date(item.date + 'T12:00:00'),
    met: item.met,
    notes: item.notes || undefined,
  }));
}

export async function upsertDailyGoalEntry(entryData: {
  goalId: string;
  date: Date;
  met: boolean;
  notes?: string;
}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const dateStr = toLocalDateString(entryData.date);

  const dbData = {
    user_id: session.user.id,
    goal_id: entryData.goalId,
    date: dateStr,
    met: entryData.met,
    notes: entryData.notes,
  };

  // Upsert: insert or update on conflict (user_id, goal_id, date)
  const { data, error } = await supabase
    .from('daily_goal_entries')
    .upsert(dbData, { onConflict: 'user_id,goal_id,date' })
    .select()
    .single();

  if (error) {
    console.error('Error upserting goal entry:', error);
    throw error;
  }

  return {
    id: data.id,
    userId: data.user_id,
    goalId: data.goal_id,
    date: new Date(data.date + 'T12:00:00'),
    met: data.met,
    notes: data.notes || undefined,
  };
}

export async function deleteDailyGoalEntry(id: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('daily_goal_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id);

  if (error) {
    console.error('Error deleting goal entry:', error);
    throw error;
  }

  return true;
}
