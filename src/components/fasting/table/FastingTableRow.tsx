
import React from 'react';
import { format } from 'date-fns';
import { FastingLog } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Check, X } from "lucide-react";
import { calculateDuration } from '../utils/fastingUtils';

interface FastingTableRowProps {
  log: FastingLog;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const FastingTableRow: React.FC<FastingTableRowProps> = ({ log, onEdit, onDelete }) => {
  const startTime = new Date(log.startTime);
  const endTime = log.endTime ? new Date(log.endTime) : undefined;
  
  // Format eating window hours as hours:minutes without decimal places
  const formatEatingWindow = (hours?: number) => {
    if (hours === undefined || hours === null) return '-';
    
    // If hours is 0, just show 0:00
    if (hours === 0) return '0:00';
    
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    
    return `${wholeHours}:${minutes.toString().padStart(2, '0')}`;
  };
  
  return (
    <tr key={log.id}>
      <td className="px-6 py-4 whitespace-nowrap text-sm">{format(startTime, 'MM/dd/yyyy')}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">{format(startTime, 'EEE')}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">{format(startTime, 'h:mm a')}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">{endTime ? format(endTime, 'h:mm a') : '-'}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">{calculateDuration(startTime, endTime)}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">{formatEatingWindow(log.eatingWindowHours)}</td>
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
            onClick={() => onEdit(log.id)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onDelete(log.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default FastingTableRow;
