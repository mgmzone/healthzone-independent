import { supabase } from "@/lib/supabase";
import { JournalEntry } from "@/lib/types";
import { toLocalDateString } from '@/lib/utils/dateUtils';

// Journal intentionally spans all periods — it's the user's diary, not
// period-scoped metrics. Filter by date range in the UI instead.

export interface JournalListFilters {
  search?: string;
  tags?: string[];
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string;
  limit?: number;
  offset?: number;
}

function mapRow(row: any): JournalEntry {
  return {
    id: row.id,
    userId: row.user_id,
    entryDate: row.entry_date,
    entryTime: row.entry_time || undefined,
    title: row.title || undefined,
    body: row.body,
    tags: Array.isArray(row.tags) ? row.tags : [],
    painLevel: row.pain_level ?? undefined,
    mood: row.mood ?? undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export async function listJournalEntries(filters: JournalListFilters = {}): Promise<JournalEntry[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  let query = supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', session.user.id)
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (filters.dateFrom) query = query.gte('entry_date', filters.dateFrom);
  if (filters.dateTo) query = query.lte('entry_date', filters.dateTo);

  // Tag filter: match any of the provided tags (array overlap)
  if (filters.tags && filters.tags.length > 0) {
    query = query.overlaps('tags', filters.tags);
  }

  // Case-insensitive contains search against title+body.
  // Strip PostgREST filter metacharacters so a user's search can't break the query.
  if (filters.search && filters.search.trim()) {
    const needle = filters.search.trim().replace(/[,()*%\\]/g, ' ');
    if (needle) {
      query = query.or(`title.ilike.%${needle}%,body.ilike.%${needle}%`);
    }
  }

  if (filters.limit) query = query.limit(filters.limit);
  if (filters.offset) query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching journal entries:', error);
    return [];
  }
  return (data || []).map(mapRow);
}

export async function addJournalEntry(entry: Partial<JournalEntry>): Promise<JournalEntry> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const entryDate = entry.entryDate
    ? entry.entryDate
    : toLocalDateString(new Date());

  const dbData = {
    user_id: session.user.id,
    entry_date: entryDate,
    entry_time: entry.entryTime ?? null,
    title: entry.title?.trim() || null,
    body: entry.body || '',
    tags: entry.tags ?? [],
    pain_level: entry.painLevel ?? null,
    mood: entry.mood ?? null,
  };

  const { data, error } = await supabase
    .from('journal_entries')
    .insert(dbData)
    .select()
    .single();

  if (error) {
    console.error('Error adding journal entry:', error);
    throw error;
  }
  return mapRow(data);
}

export async function updateJournalEntry(id: string, entry: Partial<JournalEntry>): Promise<JournalEntry> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const dbData: Record<string, any> = {};
  if (entry.entryDate !== undefined) dbData.entry_date = entry.entryDate;
  if (entry.entryTime !== undefined) dbData.entry_time = entry.entryTime || null;
  if (entry.title !== undefined) dbData.title = entry.title?.trim() || null;
  if (entry.body !== undefined) dbData.body = entry.body;
  if (entry.tags !== undefined) dbData.tags = entry.tags;
  if (entry.painLevel !== undefined) dbData.pain_level = entry.painLevel ?? null;
  if (entry.mood !== undefined) dbData.mood = entry.mood ?? null;

  const { data, error } = await supabase
    .from('journal_entries')
    .update(dbData)
    .eq('id', id)
    .eq('user_id', session.user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating journal entry:', error);
    throw error;
  }
  return mapRow(data);
}

export async function deleteJournalEntry(id: string): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id);

  if (error) {
    console.error('Error deleting journal entry:', error);
    throw error;
  }
  return true;
}

// Returns the unique tag set the user has ever used, for autocomplete / chips.
export async function listUserTags(): Promise<string[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase
    .from('journal_entries')
    .select('tags')
    .eq('user_id', session.user.id);

  if (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
  const set = new Set<string>();
  for (const row of data || []) {
    for (const t of row.tags || []) if (t) set.add(t);
  }
  return Array.from(set).sort();
}
