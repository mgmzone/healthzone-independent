
import React from 'react';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";

interface FastingTimeInfoProps {
  startTime: Date;
  onEndFast: () => void;
}

const FastingTimeInfo: React.FC<FastingTimeInfoProps> = ({ 
  startTime, 
  onEndFast 
}) => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-2 w-full mb-4">
        <div className="text-sm">
          <div className="text-muted-foreground text-xs">Start</div>
          <div>{format(new Date(startTime), 'E dd MMM')}</div>
          <div>{format(new Date(startTime), 'h:mm a')}</div>
        </div>
        <div className="text-sm text-right">
          <div className="text-muted-foreground text-xs">End</div>
          <div>Today</div>
          <div>{format(new Date(), 'h:mm a')}</div>
        </div>
      </div>
      
      <Button 
        className="w-full bg-blue-500 hover:bg-blue-600" 
        onClick={onEndFast}
      >
        End Fast
      </Button>
    </div>
  );
};

export default FastingTimeInfo;
