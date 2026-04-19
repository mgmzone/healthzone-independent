import React from 'react';
import { BookOpen } from 'lucide-react';

interface JournalEmptyStateProps {
  hasFilters: boolean;
}

const JournalEmptyState: React.FC<JournalEmptyStateProps> = ({ hasFilters }) => {
  return (
    <div className="border rounded-lg p-12 text-center bg-card">
      <BookOpen className="h-10 w-10 mx-auto mb-4 text-muted-foreground/60" />
      {hasFilters ? (
        <>
          <h3 className="text-lg font-medium mb-1">No entries match your filters</h3>
          <p className="text-sm text-muted-foreground">Try clearing the search, date range, or tag filters.</p>
        </>
      ) : (
        <>
          <h3 className="text-lg font-medium mb-1">Your journal is empty</h3>
          <p className="text-sm text-muted-foreground">
            Write about your day — workouts, nutrition, goals, how you're feeling. Anything.
          </p>
        </>
      )}
    </div>
  );
};

export default JournalEmptyState;
