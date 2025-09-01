
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Play, Square } from "lucide-react";
import { FastingLog } from '@/lib/types';

interface FastingPageHeaderProps {
  onAddFast: () => void;
  activeFast: FastingLog | null;
  onStartFast: () => void;
  onEndFast: () => void;
  isPeriodActive?: boolean;
}

const FastingPageHeader: React.FC<FastingPageHeaderProps> = ({ 
  onAddFast, 
  activeFast, 
  onStartFast, 
  onEndFast,
  isPeriodActive = true,
}) => {
  return (
    <div className="flex justify-end items-center mb-6">
      <div className="flex space-x-2">
        {activeFast ? (
          <Button 
            variant="destructive" 
            onClick={onEndFast}
            className="flex items-center gap-2"
          >
            <Square className="h-4 w-4" />
            End Current Fast
          </Button>
        ) : (
          <Button 
            onClick={onStartFast}
            disabled={!isPeriodActive}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            Start Fast
          </Button>
        )}
        <Button 
          variant="outline" 
          onClick={onAddFast}
          disabled={!isPeriodActive}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Past Fast
        </Button>
      </div>
    </div>
  );
};

export default FastingPageHeader;
