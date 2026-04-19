import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/AuthContext';
import { JournalEntry } from '@/lib/types';
import {
  listJournalEntries,
  addJournalEntry as addEntryService,
  updateJournalEntry as updateEntryService,
  deleteJournalEntry as deleteEntryService,
  listUserTags,
  JournalListFilters,
} from '@/lib/services/journalService';

export function useJournalData(filters: JournalListFilters = {}) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Serialize filters so the effect depends on their contents, not identity.
  const filtersKey = JSON.stringify(filters);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const [list, tagList] = await Promise.all([
        listJournalEntries(filters),
        listUserTags(),
      ]);
      setEntries(list);
      setTags(tagList);
    } catch (err) {
      console.error('Error loading journal:', err);
      toast({
        title: 'Error',
        description: 'Failed to load journal entries',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey, toast]);

  useEffect(() => {
    if (!user) {
      setEntries([]);
      setTags([]);
      setIsLoading(false);
      return;
    }
    refresh();
  }, [user, refresh]);

  const addEntry = async (data: Partial<JournalEntry>) => {
    try {
      const created = await addEntryService(data);
      setEntries((prev) => [created, ...prev]);
      // Refresh tag list if new tags were introduced.
      if (data.tags?.some((t) => !tags.includes(t))) {
        setTags(await listUserTags());
      }
      toast({ title: 'Saved', description: 'Journal entry added.' });
      return created;
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to save journal entry',
        variant: 'destructive',
      });
      throw err;
    }
  };

  const updateEntry = async (id: string, data: Partial<JournalEntry>) => {
    try {
      const updated = await updateEntryService(id, data);
      setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)));
      if (data.tags) {
        setTags(await listUserTags());
      }
      toast({ title: 'Saved', description: 'Journal entry updated.' });
      return updated;
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update journal entry',
        variant: 'destructive',
      });
      throw err;
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      await deleteEntryService(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      toast({ title: 'Deleted', description: 'Journal entry removed.' });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete journal entry',
        variant: 'destructive',
      });
      throw err;
    }
  };

  return {
    entries,
    tags,
    isLoading,
    addEntry,
    updateEntry,
    deleteEntry,
    refresh,
  };
}
