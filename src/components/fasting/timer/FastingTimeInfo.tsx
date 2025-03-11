
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
    <>
      <div className="grid grid-cols-2 w-full gap-2 mt-1">
        <div className="text-xs">
          <div className="text-muted-foreground">Start</div>
          <div className="font-medium">{format(new Date(startTime), 'E dd MMM')}</div>
          <div>{format(new Date(startTime), 'h:mm a')}</div>
        </div>
        <div className="text-xs text-right">
          <div className="text-muted-foreground">End</div>
          <div className="font-medium">Today</div>
          <div>{format(new Date(), 'h:mm a')}</div>
        </div>
      </div>
      
      <Button 
        className="w-full mt-2 text-sm py-1 h-8" 
        onClick={onEndFast}
      >
        End Fast
      </Button>
    </>
  );
};

export default FastingTimeInfo;
