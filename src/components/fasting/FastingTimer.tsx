
import React, { useState, useEffect } from 'react';
import { differenceInSeconds } from 'date-fns';
import { Card } from "@/components/ui/card";
import { FastingLog } from '@/lib/types';
import FastingProgressCircle from './timer/FastingProgressCircle';
import FastingTimeInfo from './timer/FastingTimeInfo';
import FastingTips from './timer/FastingTips';
import NoActiveFast from './timer/NoActiveFast';

interface FastingTimerProps {
  activeFast: FastingLog | null;
  onEndFast: () => void;
}

const FastingTimer: React.FC<FastingTimerProps> = ({ activeFast, onEndFast }) => {
  const [timeElapsed, setTimeElapsed] = useState<{ hours: number; minutes: number; seconds: number }>({ hours: 0, minutes: 0, seconds: 0 });
  const [timeRemaining, setTimeRemaining] = useState<{ hours: number; minutes: number; seconds: number }>({ hours: 0, minutes: 0, seconds: 0 });
  const [progress, setProgress] = useState(0);
  const [rotations, setRotations] = useState(0);

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
      
      // Calculate progress percentage (can exceed 100% for fasts > 24 hours)
      const progressPercentage = (totalSecondsElapsed / totalFastingSeconds) * 100;
      
      // Calculate number of complete rotations (only for visual effect)
      const completeRotations = Math.floor(progressPercentage / 100);
      setRotations(completeRotations);
      
      // The circle progress should be the remainder after full rotations (0-100)
      setProgress(progressPercentage % 100);
      
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [activeFast]);

  if (!activeFast) {
    return <NoActiveFast />;
  }

  return (
    <Card className="p-4 h-[70%] flex flex-col items-center justify-between overflow-hidden">
      <div className="flex-1 flex items-center justify-center">
        <FastingProgressCircle 
          progress={progress} 
          rotations={rotations} 
          timeElapsed={timeElapsed} 
          timeRemaining={timeRemaining} 
        />
      </div>
      
      <div className="mt-auto">
        <FastingTimeInfo 
          startTime={activeFast.startTime} 
          onEndFast={onEndFast} 
        />
        
        <FastingTips />
      </div>
    </Card>
  );
};

export default FastingTimer;
