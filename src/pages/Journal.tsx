import React, { useMemo, useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { BookOpen, Loader2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useJournalData } from '@/hooks/useJournalData';
import { JournalEntry } from '@/lib/types';
import JournalEntryCard from '@/components/journal/JournalEntryCard';
import JournalEntryModal from '@/components/journal/JournalEntryModal';
import JournalFilters, { JournalFiltersState } from '@/components/journal/JournalFilters';
import JournalEmptyState from '@/components/journal/JournalEmptyState';
import JournalInsightsCard from '@/components/journal/JournalInsightsCard';
import DoctorReportDialog from '@/components/journal/DoctorReportDialog';

const Journal: React.FC = () => {
  const [filters, setFilters] = useState<JournalFiltersState>({
    search: '',
    dateFrom: '',
    dateTo: '',
    tags: [],
  });

  const serviceFilters = useMemo(
    () => ({
      search: filters.search || undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      tags: filters.tags.length > 0 ? filters.tags : undefined,
    }),
    [filters]
  );

  const { entries, tags, isLoading, addEntry, updateEntry, deleteEntry } =
    useJournalData(serviceFilters);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<JournalEntry | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openNew = () => {
    setEditing(null);
    setIsModalOpen(true);
  };
  const openEdit = (entry: JournalEntry) => {
    setEditing(entry);
    setIsModalOpen(true);
  };

  const handleSave = async (data: Partial<JournalEntry>) => {
    if (editing) {
      await updateEntry(editing.id, data);
    } else {
      await addEntry(data);
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      await deleteEntry(deleteId);
      setDeleteId(null);
    }
  };

  // Group entries by year-month for a diary-style header
  const grouped = useMemo(() => {
    const groups: { key: string; label: string; entries: JournalEntry[] }[] = [];
    const byKey = new Map<string, { label: string; entries: JournalEntry[] }>();
    for (const e of entries) {
      const d = new Date(e.entryDate + 'T12:00:00');
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      const label = format(d, 'MMMM yyyy');
      const bucket = byKey.get(key) || { label, entries: [] };
      bucket.entries.push(e);
      byKey.set(key, bucket);
    }
    // Preserve descending order (entries already come newest-first)
    const seen = new Set<string>();
    for (const e of entries) {
      const d = new Date(e.entryDate + 'T12:00:00');
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const bucket = byKey.get(key)!;
      groups.push({ key, label: bucket.label, entries: bucket.entries });
    }
    return groups;
  }, [entries]);

  const hasFilters =
    !!filters.search || !!filters.dateFrom || !!filters.dateTo || filters.tags.length > 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BookOpen className="h-7 w-7 text-primary" />
              Journal
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Narrative notes on your recovery, workouts, nutrition, goals — whatever you want to remember.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DoctorReportDialog availableTags={tags} />
            <Button onClick={openNew}>
              <Plus className="h-4 w-4 mr-1" />
              New Entry
            </Button>
          </div>
        </div>

        {entries.length >= 3 && !hasFilters && <JournalInsightsCard />}

        <div className="mb-8">
          <JournalFilters state={filters} onChange={setFilters} availableTags={tags} />
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            Loading your journal…
          </div>
        ) : entries.length === 0 ? (
          <JournalEmptyState hasFilters={hasFilters} />
        ) : (
          <div className="space-y-10">
            {grouped.map((group) => (
              <section key={group.key}>
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {group.label}
                  </h2>
                  <div className="flex-1 border-t border-border" />
                  <span className="text-xs text-muted-foreground">
                    {group.entries.length} {group.entries.length === 1 ? 'entry' : 'entries'}
                  </span>
                </div>
                <div className="space-y-3">
                  {group.entries.map((entry) => (
                    <JournalEntryCard
                      key={entry.id}
                      entry={entry}
                      onEdit={openEdit}
                      onDelete={setDeleteId}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <JournalEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initial={editing}
        tagSuggestions={tags}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The journal entry will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Journal;
