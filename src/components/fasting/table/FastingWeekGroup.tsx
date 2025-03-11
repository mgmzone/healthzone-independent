
import React from 'react';
import { FastingLog } from '@/lib/types';
import FastingTableHeader from './FastingTableHeader';
import FastingTableRow from './FastingTableRow';

interface FastingWeekGroupProps {
  weekKey: string;
  logs: FastingLog[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const FastingWeekGroup: React.FC<FastingWeekGroupProps> = ({ 
  weekKey, 
  logs, 
  onEdit, 
  onDelete 
}) => {
  // Sort logs in descending order by date
  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );

  // Get the year from the first log in the group (most recent one after sorting)
  const yearDisplay = sortedLogs.length > 0 
    ? new Date(sortedLogs[0].startTime).getFullYear() 
    : new Date().getFullYear();

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium text-lg">
          {weekKey}, {yearDisplay}
        </h3>
        <div className="text-sm text-gray-500">
          Count: {logs.length}
        </div>
      </div>
      
      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200">
          <FastingTableHeader />
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedLogs.map((log) => (
              <FastingTableRow 
                key={log.id} 
                log={log} 
                onEdit={onEdit} 
                onDelete={onDelete} 
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FastingWeekGroup;
