
import React, { useState } from 'react';
import { format, differenceInSeconds } from 'date-fns';
import { FastingLog } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Check, X, Loader2 } from "lucide-react";
import FastingEntryModal from './FastingEntryModal';
import DeleteFastingConfirmDialog from './DeleteFastingConfirmDialog';
import { useMutation } from '@tanstack/react-query';
import { deleteFastingLog } from '@/lib/services/fastingService';

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

  const calculateDuration = (startTime: Date, endTime?: Date) => {
    if (!endTime) return '-';
    
    const durationInSeconds = differenceInSeconds(
      new Date(endTime),
      new Date(startTime)
    );
    
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  // Group logs by week
  const groupByWeek = () => {
    const weeks: { [key: string]: FastingLog[] } = {};
    
    fastingLogs.forEach(log => {
      const startDate = new Date(log.startTime);
      const weekNumber = getISOWeek(startDate);
      const year = startDate.getFullYear();
      const weekKey = `${year}-W${weekNumber}`;
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = [];
      }
      
      weeks[weekKey].push(log);
    });
    
    return weeks;
  };

  // Helper function to get ISO week number
  const getISOWeek = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  const weeks = groupByWeek();
  const editingFast = editingId ? fastingLogs.find(f => f.id === editingId) : null;

  if (isLoading) {
    return (
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Fasting History</h2>
        <div className="flex justify-center items-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Fasting History</h2>
        
        {(fastingLogs.length === 0 || Object.entries(weeks).length === 0) ? (
          <div className="p-8 text-center border rounded-lg">
            <p className="text-gray-500">No fasting logs yet. Start a fast to begin tracking.</p>
          </div>
        ) : (
          Object.entries(weeks)
            .sort(([weekA], [weekB]) => weekB.localeCompare(weekA))
            .map(([weekKey, logs]) => (
              <div key={weekKey} className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-lg">
                    Week {weekKey.split('-W')[1]}, {weekKey.split('-')[0]}
                  </h3>
                  <div className="text-sm text-gray-500">
                    Count: {logs.length}
                  </div>
                </div>
                
                <div className="overflow-x-auto rounded-lg border">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Eating Window</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {logs
                        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                        .map((log) => {
                          const startTime = new Date(log.startTime);
                          const endTime = log.endTime ? new Date(log.endTime) : undefined;
                          
                          return (
                            <tr key={log.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">{format(startTime, 'MM/dd/yyyy')}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">{format(startTime, 'EEE')}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">{format(startTime, 'h:mm a')}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">{endTime ? format(endTime, 'h:mm a') : '-'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">{calculateDuration(startTime, endTime)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">{log.eatingWindowHours ? `${log.eatingWindowHours}:00` : '-'}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {endTime ? (
                                  <Check className="h-5 w-5 text-green-500" />
                                ) : (
                                  <X className="h-5 w-5 text-red-500" />
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex space-x-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleEdit(log.id)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setDeleteConfirmId(log.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
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
