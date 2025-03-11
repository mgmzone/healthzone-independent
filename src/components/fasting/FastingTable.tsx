
import React, { useState } from 'react';
import { FastingLog } from '@/lib/types';
import { subDays, subMonths, subYears, startOfDay } from 'date-fns';
import FastingEntryModal from './FastingEntryModal';
import DeleteFastingConfirmDialog from './DeleteFastingConfirmDialog';
import FastingWeekGroup from './table/FastingWeekGroup';
import FastingEmptyState from './table/FastingEmptyState';
import FastingTableLoadingState from './table/FastingTableLoadingState';
import { groupLogsByWeek } from './utils/fastingUtils';

interface FastingTableProps {
  fastingLogs: FastingLog[];
  isLoading?: boolean;
  timeFilter: 'week' | 'month' | 'year';
  onUpdateFast: (
    id: string,
    updatedFast: {
      startTime: Date;
      endTime?: Date;
      fastingHours?: number;
      eatingWindowHours?: number;
    }
  ) => void;
  onDeleteFast: (id: string) => void;
}

const FastingTable: React.FC<FastingTableProps> = ({ 
  fastingLogs,
  isLoading = false,
  timeFilter,
  onUpdateFast,
  onDeleteFast
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = (fastId: string) => {
    setEditingId(fastId);
  };

  const handleSave = (
    updatedFast: {
      startTime: Date;
      endTime?: Date;
      fastingHours?: number;
      eatingWindowHours?: number;
    }
  ) => {
    if (editingId) {
      onUpdateFast(editingId, updatedFast);
      setEditingId(null);
    }
  };

  const handleDelete = () => {
    if (deleteConfirmId) {
      setIsDeleting(true);
      onDeleteFast(deleteConfirmId);
      setIsDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  // Filter logs based on timeFilter
  const filterDate = startOfDay(
    timeFilter === 'week'
      ? subDays(new Date(), 7)
      : timeFilter === 'month'
      ? subMonths(new Date(), 1)
      : subYears(new Date(), 1)
  );

  const filteredLogs = fastingLogs.filter(
    log => new Date(log.startTime) >= filterDate
  );

  const weeks = groupLogsByWeek(filteredLogs);
  const editingFast = editingId ? fastingLogs.find(f => f.id === editingId) : null;

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Fasting History</h2>
        
        {isLoading ? (
          <FastingTableLoadingState />
        ) : fastingLogs.length === 0 || Object.entries(weeks).length === 0 ? (
          <FastingEmptyState />
        ) : (
          Object.entries(weeks)
            .sort(([weekA], [weekB]) => {
              // Extract numbers from the week keys for proper numerical sorting
              const weekNumA = parseInt(weekA.split(' ')[1]);
              const weekNumB = parseInt(weekB.split(' ')[1]);
              
              // Sort in descending order (larger number first for most recent week)
              return weekNumB - weekNumA;
            })
            .map(([weekKey, logs]) => (
              <FastingWeekGroup 
                key={weekKey} 
                weekKey={weekKey} 
                logs={logs} 
                onEdit={handleEdit} 
                onDelete={setDeleteConfirmId}
              />
            ))
        )}
      </div>

      {editingFast && (
        <FastingEntryModal
          isOpen={!!editingId}
          onClose={() => setEditingId(null)}
          onSave={handleSave}
          initialFast={editingFast}
        />
      )}

      <DeleteFastingConfirmDialog
        isOpen={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
        onConfirmDelete={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default FastingTable;
