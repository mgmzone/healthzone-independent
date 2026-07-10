import { supabase } from "@/lib/supabase";
import { EventType, TrackedEvent } from "@/lib/types";

// ============================================================
// Event types (per-user tracker definitions)
// ============================================================

type EventTypeRow = {
  id: string;
  user_id: string;
  key: string;
  label: string;
  icon: string | null;
  unit: string | null;
  default_quantity: number;
  daily_target: number | null;
  color: string | null;
  sort_order: number;
  is_active: boolean;
};

function mapEventType(row: EventTypeRow): EventType {
  return {
    id: row.id,
    userId: row.user_id,
    key: row.key,
    label: row.label,
    icon: row.icon ?? undefined,
    unit: row.unit ?? undefined,
    defaultQuantity: Number(row.default_quantity),
    dailyTarget: row.daily_target ?? undefined,
    color: row.color ?? undefined,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

export async function getEventTypes(includeInactive = false): Promise<EventType[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  let query = supabase
    .from('event_types')
    .select('*')
    .eq('user_id', session.user.id)
    .order('sort_order', { ascending: true });
  if (!includeInactive) query = query.eq('is_active', true);

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching event types:', error);
    return [];
  }
  return (data as EventTypeRow[]).map(mapEventType);
}

export async function addEventType(input: Partial<EventType>): Promise<EventType> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('event_types')
    .insert({
      user_id: session.user.id,
      key: input.key ?? (input.label || 'tracker').toLowerCase().replace(/\s+/g, '_'),
      label: input.label ?? 'Tracker',
      icon: input.icon ?? null,
      unit: input.unit ?? null,
      default_quantity: input.defaultQuantity ?? 1,
      daily_target: input.dailyTarget ?? null,
      color: input.color ?? null,
      sort_order: input.sortOrder ?? 0,
      is_active: input.isActive ?? true,
    })
    .select()
    .single();

  if (error) throw error;
  return mapEventType(data as EventTypeRow);
}

export async function updateEventType(id: string, input: Partial<EventType>): Promise<EventType> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const patch: Record<string, unknown> = {};
  if (input.label !== undefined) patch.label = input.label;
  if (input.icon !== undefined) patch.icon = input.icon;
  if (input.unit !== undefined) patch.unit = input.unit;
  if (input.defaultQuantity !== undefined) patch.default_quantity = input.defaultQuantity;
  if (input.dailyTarget !== undefined) patch.daily_target = input.dailyTarget;
  if (input.color !== undefined) patch.color = input.color;
  if (input.sortOrder !== undefined) patch.sort_order = input.sortOrder;
  if (input.isActive !== undefined) patch.is_active = input.isActive;

  const { data, error } = await supabase
    .from('event_types')
    .update(patch)
    .eq('id', id)
    .eq('user_id', session.user.id)
    .select()
    .single();

  if (error) throw error;
  return mapEventType(data as EventTypeRow);
}

export async function deleteEventType(id: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('event_types')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id);
  if (error) throw error;
}

// ============================================================
// Tracked events (individual tally entries)
// ============================================================

type TrackedEventRow = {
  id: string;
  user_id: string;
  event_type_id: string | null;
  event_key: string;
  occurred_at: string;
  quantity: number;
  unit: string | null;
  notes: string | null;
};

function mapTrackedEvent(row: TrackedEventRow): TrackedEvent {
  return {
    id: row.id,
    userId: row.user_id,
    eventTypeId: row.event_type_id ?? undefined,
    eventKey: row.event_key,
    occurredAt: new Date(row.occurred_at),
    quantity: Number(row.quantity),
    unit: row.unit ?? undefined,
    notes: row.notes ?? undefined,
  };
}

// Log one tally event (defaults occurred_at to now).
export async function logTrackedEvent(input: {
  eventType: EventType;
  quantity?: number;
  occurredAt?: Date;
  notes?: string;
}): Promise<TrackedEvent> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('tracked_events')
    .insert({
      user_id: session.user.id,
      event_type_id: input.eventType.id,
      event_key: input.eventType.key,
      quantity: input.quantity ?? input.eventType.defaultQuantity,
      unit: input.eventType.unit ?? null,
      occurred_at: (input.occurredAt ?? new Date()).toISOString(),
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return mapTrackedEvent(data as TrackedEventRow);
}

export async function updateTrackedEventTime(id: string, occurredAt: Date): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('tracked_events')
    .update({ occurred_at: occurredAt.toISOString() })
    .eq('id', id)
    .eq('user_id', session.user.id);
  if (error) throw error;
}

export async function deleteTrackedEvent(id: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('tracked_events')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id);
  if (error) throw error;
}

// Fetch events within an inclusive local-day range [start, end].
export async function getTrackedEvents(start: Date, end: Date): Promise<TrackedEvent[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase
    .from('tracked_events')
    .select('*')
    .eq('user_id', session.user.id)
    .gte('occurred_at', start.toISOString())
    .lte('occurred_at', end.toISOString())
    .order('occurred_at', { ascending: false });

  if (error) {
    console.error('Error fetching tracked events:', error);
    return [];
  }
  return (data as TrackedEventRow[]).map(mapTrackedEvent);
}

// Per-key summed totals for today (keyed by event_key), for progress vs target.
export async function getTodayTotals(): Promise<Record<string, number>> {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const events = await getTrackedEvents(start, end);

  return events.reduce<Record<string, number>>((acc, e) => {
    acc[e.eventKey] = (acc[e.eventKey] ?? 0) + e.quantity;
    return acc;
  }, {});
}
