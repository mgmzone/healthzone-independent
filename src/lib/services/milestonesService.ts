import { supabase } from '@/lib/supabase';
import { PeriodMilestone } from '@/lib/types';

function toDomain(row: any): PeriodMilestone {
  return {
    id: row.id,
    periodId: row.period_id,
    userId: row.user_id,
    name: row.name,
    date: row.date,
    isPriority: row.is_priority,
    notes: row.notes || undefined,
    sortOrder: row.sort_order,
  };
}

export async function getMilestones(periodId: string): Promise<PeriodMilestone[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase
    .from('period_milestones')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('period_id', periodId)
    .order('sort_order', { ascending: true })
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching milestones:', error);
    return [];
  }

  return data.map(toDomain);
}

export async function getPriorityMilestone(periodId: string): Promise<PeriodMilestone | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('period_milestones')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('period_id', periodId)
    .eq('is_priority', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching priority milestone:', error);
    return null;
  }

  return data ? toDomain(data) : null;
}

export async function addMilestone(
  milestone: Omit<PeriodMilestone, 'id' | 'userId' | 'sortOrder'> & { sortOrder?: number }
): Promise<PeriodMilestone> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  // If adding as priority, clear any existing priority first (partial unique index enforces one-per-period)
  if (milestone.isPriority) {
    await supabase
      .from('period_milestones')
      .update({ is_priority: false })
      .eq('user_id', session.user.id)
      .eq('period_id', milestone.periodId)
      .eq('is_priority', true);
  }

  const { data, error } = await supabase
    .from('period_milestones')
    .insert({
      user_id: session.user.id,
      period_id: milestone.periodId,
      name: milestone.name,
      date: milestone.date,
      is_priority: milestone.isPriority,
      notes: milestone.notes,
      sort_order: milestone.sortOrder ?? 0,
    })
    .select()
    .single();

  if (error) throw error;
  return toDomain(data);
}

export async function updateMilestone(
  id: string,
  updates: Partial<Omit<PeriodMilestone, 'id' | 'userId' | 'periodId'>>
): Promise<PeriodMilestone> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const dbUpdates: Record<string, any> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.date !== undefined) dbUpdates.date = updates.date;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null;
  if (updates.sortOrder !== undefined) dbUpdates.sort_order = updates.sortOrder;
  // is_priority updates go through setPriorityMilestone to enforce the clear-then-set order

  const { data, error } = await supabase
    .from('period_milestones')
    .update(dbUpdates)
    .eq('id', id)
    .eq('user_id', session.user.id)
    .select()
    .single();

  if (error) throw error;
  return toDomain(data);
}

export async function deleteMilestone(id: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('period_milestones')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id);

  if (error) throw error;
}

// Clears the current priority on the period, then sets the target to priority.
// Partial unique index on (period_id) where is_priority requires this order.
export async function setPriorityMilestone(id: string, periodId: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { error: clearError } = await supabase
    .from('period_milestones')
    .update({ is_priority: false })
    .eq('user_id', session.user.id)
    .eq('period_id', periodId)
    .eq('is_priority', true);
  if (clearError) throw clearError;

  const { error: setError } = await supabase
    .from('period_milestones')
    .update({ is_priority: true })
    .eq('id', id)
    .eq('user_id', session.user.id);
  if (setError) throw setError;
}

export async function clearPriorityMilestone(periodId: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('period_milestones')
    .update({ is_priority: false })
    .eq('user_id', session.user.id)
    .eq('period_id', periodId)
    .eq('is_priority', true);
  if (error) throw error;
}
