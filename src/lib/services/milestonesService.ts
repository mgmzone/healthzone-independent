import { supabase } from '@/lib/supabase';
import { Milestone } from '@/lib/types';

type MilestoneRow = {
  id: string;
  user_id: string;
  name: string;
  type: string;
  milestone_date: string;
  is_priority: boolean;
  notes: string | null;
  sort_order: number;
};

function toDomain(row: MilestoneRow): Milestone {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    type: row.type,
    date: row.milestone_date,
    isPriority: row.is_priority,
    notes: row.notes || undefined,
    sortOrder: row.sort_order,
  };
}

// All milestones for the signed-in user, chronological.
export async function getMilestones(): Promise<Milestone[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase
    .from('milestones')
    .select('*')
    .eq('user_id', session.user.id)
    .order('milestone_date', { ascending: true });

  if (error) {
    console.error('Error fetching milestones:', error);
    return [];
  }
  return (data as MilestoneRow[]).map(toDomain);
}

export async function getPriorityMilestone(): Promise<Milestone | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('milestones')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('is_priority', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching priority milestone:', error);
    return null;
  }
  return data ? toDomain(data as MilestoneRow) : null;
}

export async function addMilestone(input: {
  name: string;
  type: string;
  date: string;
  isPriority?: boolean;
  notes?: string;
  sortOrder?: number;
}): Promise<Milestone> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  // One priority per user: clear any existing priority before setting a new one
  // (the partial unique index would otherwise reject the insert).
  if (input.isPriority) {
    await supabase
      .from('milestones')
      .update({ is_priority: false })
      .eq('user_id', session.user.id)
      .eq('is_priority', true);
  }

  const { data, error } = await supabase
    .from('milestones')
    .insert({
      user_id: session.user.id,
      name: input.name,
      type: input.type,
      milestone_date: input.date,
      is_priority: input.isPriority ?? false,
      notes: input.notes ?? null,
      sort_order: input.sortOrder ?? 0,
    })
    .select()
    .single();

  if (error) throw error;
  return toDomain(data as MilestoneRow);
}

export async function updateMilestone(
  id: string,
  updates: Partial<Pick<Milestone, 'name' | 'type' | 'date' | 'notes' | 'sortOrder'>>,
): Promise<Milestone> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const dbUpdates: Record<string, unknown> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.type !== undefined) dbUpdates.type = updates.type;
  if (updates.date !== undefined) dbUpdates.milestone_date = updates.date;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null;
  if (updates.sortOrder !== undefined) dbUpdates.sort_order = updates.sortOrder;
  // is_priority changes go through setPriorityMilestone to enforce clear-then-set

  const { data, error } = await supabase
    .from('milestones')
    .update(dbUpdates)
    .eq('id', id)
    .eq('user_id', session.user.id)
    .select()
    .single();

  if (error) throw error;
  return toDomain(data as MilestoneRow);
}

export async function deleteMilestone(id: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('milestones')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id);
  if (error) throw error;
}

// Clear the user's current priority, then set the target as priority.
export async function setPriorityMilestone(id: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { error: clearError } = await supabase
    .from('milestones')
    .update({ is_priority: false })
    .eq('user_id', session.user.id)
    .eq('is_priority', true);
  if (clearError) throw clearError;

  const { error: setError } = await supabase
    .from('milestones')
    .update({ is_priority: true })
    .eq('id', id)
    .eq('user_id', session.user.id);
  if (setError) throw setError;
}

export async function clearPriorityMilestone(): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('milestones')
    .update({ is_priority: false })
    .eq('user_id', session.user.id)
    .eq('is_priority', true);
  if (error) throw error;
}
