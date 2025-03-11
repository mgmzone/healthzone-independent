
import React, { useState } from 'react';
import { FastingLog } from '@/lib/types';
import FastingEntryModal from './FastingEntryModal';
import DeleteFastingConfirmDialog from './DeleteFastingConfirmDialog';
import FastingWeekGroup from './table/FastingWeekGroup';
import FastingEmptyState from './table/FastingEmptyState';
import FastingTableLoadingState from './table/FastingTableLoadingState';
import { groupLogsByWeek } from './utils/fastingUtils';

interface FastingTableProps {
  fastingLogs: FastingLog[];
  isLoading?: boolean;
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

  const weeks = groupLogsByWeek(fastingLogs);
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
            .sort(([weekA], [weekB]) => weekB.localeCompare(weekA))
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
