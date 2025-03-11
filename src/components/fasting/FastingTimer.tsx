
import React, { useState, useEffect } from 'react';
import { format, differenceInSeconds } from 'date-fns';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Flame, Edit } from "lucide-react";
import { FastingLog } from '@/lib/types';

interface FastingTimerProps {
  activeFast: FastingLog | null;
  onEndFast: () => void;
}

const FastingTimer: React.FC<FastingTimerProps> = ({ activeFast, onEndFast }) => {
  const [timeElapsed, setTimeElapsed] = useState<{ hours: number; minutes: number; seconds: number }>({ hours: 0, minutes: 0, seconds: 0 });
  const [timeRemaining, setTimeRemaining] = useState<{ hours: number; minutes: number; seconds: number }>({ hours: 0, minutes: 0, seconds: 0 });
  const [progress, setProgress] = useState(0);

  // Calculate time elapsed and time remaining
  useEffect(() => {
    if (!activeFast) return;

    const intervalId = setInterval(() => {
      const now = new Date();
      const startTime = new Date(activeFast.startTime);
      const fastingHours = activeFast.fastingHours || 16; // Default to 16 hours if not specified
      
      // Calculate total seconds elapsed
      const totalSecondsElapsed = differenceInSeconds(now, startTime);
      const totalFastingSeconds = fastingHours * 3600;
      
      // Calculate hours, minutes, seconds elapsed
      const hoursElapsed = Math.floor(totalSecondsElapsed / 3600);
      const minutesElapsed = Math.floor((totalSecondsElapsed % 3600) / 60);
      const secondsElapsed = totalSecondsElapsed % 60;
      
      setTimeElapsed({
        hours: hoursElapsed,
        minutes: minutesElapsed,
        seconds: secondsElapsed
      });
      
      // Calculate remaining time
      const remainingSeconds = Math.max(0, totalFastingSeconds - totalSecondsElapsed);
      const hoursRemaining = Math.floor(remainingSeconds / 3600);
      const minutesRemaining = Math.floor((remainingSeconds % 3600) / 60);
      const secondsRemaining = remainingSeconds % 60;
      
      setTimeRemaining({
        hours: hoursRemaining,
        minutes: minutesRemaining,
        seconds: secondsRemaining
      });
      
      // Calculate progress percentage (0-100)
      const progressPercentage = Math.min(100, (totalSecondsElapsed / totalFastingSeconds) * 100);
      setProgress(progressPercentage);
      
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [activeFast]);

  if (!activeFast) {
    return (
      <Card className="p-6 h-full flex flex-col items-center justify-center text-center">
        <Clock className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">No Active Fast</h2>
        <p className="text-muted-foreground mb-4">Start a new fast to begin tracking your progress</p>
      </Card>
    );
  }

  // Calculate angles for the progress circle
  const circumference = 2 * Math.PI * 45; // radius is 45
  const offset = circumference - (progress / 100) * circumference;
  
  // Determine color based on progress
  const getColor = (progress: number) => {
    if (progress < 25) return "#a855f7"; // purple-500
    if (progress < 50) return "#3b82f6"; // blue-500
    if (progress < 75) return "#f97316"; // orange-500
    return "#10b981"; // emerald-500
  };
  
  const progressColor = getColor(progress);

  return (
    <Card className="p-6 h-full flex flex-col items-center justify-center relative">
      <div className="relative flex items-center justify-center mb-6">
        {/* Background circle */}
        <svg className="w-64 h-64 -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="transparent"
            stroke="#1e293b" // slate-800
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="transparent"
            stroke={progressColor}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
          {/* Markers */}
          <circle cx="50%" cy="5%" r="3%" fill="#3b82f6" /> {/* 0 hours */}
          <circle cx="95%" cy="50%" r="3%" fill="#f97316" /> {/* 6 hours */}
          <circle cx="50%" cy="95%" r="3%" fill="#10b981" /> {/* 12 hours */}
          <circle cx="5%" cy="50%" r="3%" fill="#a855f7" /> {/* 18 hours */}
        </svg>
        
        {/* Flame icon in center */}
        <div className="absolute flex flex-col items-center">
          <Flame className="w-8 h-8 text-orange-500 mb-2" />
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Fasting for</div>
            <div className="text-3xl font-bold">{`${timeElapsed.hours}h ${timeElapsed.minutes}m`}</div>
            <div className="text-xs text-muted-foreground mt-1">Remaining</div>
            <div className="text-sm font-medium">{`${timeRemaining.hours}h ${timeRemaining.minutes}m`}</div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 w-full gap-4 mt-2">
        <div className="text-sm">
          <div className="text-muted-foreground">Start</div>
          <div className="font-medium">{format(new Date(activeFast.startTime), 'E dd MMM')}</div>
          <div>{format(new Date(activeFast.startTime), 'h:mm a')}</div>
        </div>
        <div className="text-sm text-right">
          <div className="text-muted-foreground">End</div>
          <div className="font-medium">Today</div>
          <div>{format(new Date(), 'h:mm a')}</div>
        </div>
      </div>
      
      <Button 
        className="w-full mt-4" 
        onClick={onEndFast}
      >
        End Fast
      </Button>
      
      <div className="mt-4 text-sm text-center">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Edit className="h-3 w-3" />
          <span>Tips</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Stay hydrated. Drink plenty of water.</p>
      </div>
    </Card>
  );
};

export default FastingTimer;
