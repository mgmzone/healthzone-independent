
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
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const dashArray = circumference;
  const dashOffset = circumference - (progress / 100) * circumference;
  
  // Create marker positions every 6 hours (90 degrees)
  const markers = [0, 6, 12, 18].map(hour => {
    const angle = (hour / 24) * 360 - 90; // -90 to start at top
    const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
    const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
    return { x, y, hour };
  });

  return (
    <Card className="p-6 h-full flex flex-col items-center justify-center relative">
      <div className="relative flex items-center justify-center mb-6">
        <svg className="w-64 h-64 -rotate-90">
          {/* Background circle */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="transparent"
            stroke="#1e293b"
            strokeWidth="8"
            className="opacity-20"
          />
          {/* Progress circle - gradient */}
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0EA5E9" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#F97316" />
            </linearGradient>
          </defs>
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="transparent"
            stroke="url(#progressGradient)"
            strokeWidth="8"
            strokeDasharray={dashArray}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
          {/* Hour markers */}
          {markers.map(({ x, y, hour }) => (
            <circle
              key={hour}
              cx={`${x}%`}
              cy={`${y}%`}
              r="2.5%"
              fill={hour === 0 ? '#0EA5E9' : hour === 6 ? '#8B5CF6' : hour === 12 ? '#F97316' : '#0EA5E9'}
              className="transition-all duration-300"
            />
          ))}
        </svg>
        
        {/* Center content */}
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
      
      {/* Start/End time display */}
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
