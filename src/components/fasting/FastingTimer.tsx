
import React, { useState, useEffect } from 'react';
import { differenceInSeconds } from 'date-fns';
import { Card } from "@/components/ui/card";
import { FastingLog } from '@/lib/types';
import FastingProgressCircle from './timer/FastingProgressCircle';
import FastingTimeInfo from './timer/FastingTimeInfo';
import FastingTips from './timer/FastingTips';
import NoActiveFast from './timer/NoActiveFast';
import { usePeriodsData } from '@/hooks/usePeriodsData';

interface FastingTimerProps {
  activeFast: FastingLog | null;
  onEndFast: () => void;
}

const FastingTimer: React.FC<FastingTimerProps> = ({ activeFast, onEndFast }) => {
  const [timeElapsed, setTimeElapsed] = useState<{ hours: number; minutes: number; seconds: number }>({ hours: 0, minutes: 0, seconds: 0 });
  const [timeRemaining, setTimeRemaining] = useState<{ hours: number; minutes: number; seconds: number }>({ hours: 0, minutes: 0, seconds: 0 });
  const [progress, setProgress] = useState(0);
  const { getCurrentPeriod } = usePeriodsData();
  const currentPeriod = getCurrentPeriod();

  useEffect(() => {
    if (!activeFast) return;

    const intervalId = setInterval(() => {
      const now = new Date();
      const startTime = new Date(activeFast.startTime);
      // Use the fasting hours from the current period, or fall back to the one in the fast itself, or default to 16
      const fastingHours = activeFast.fastingHours || (currentPeriod?.fastingSchedule?.split(':')[0] || 16);
      
      const totalSecondsElapsed = differenceInSeconds(now, startTime);
      const totalFastingSeconds = parseInt(fastingHours) * 3600;
      
      const hoursElapsed = Math.floor(totalSecondsElapsed / 3600);
      const minutesElapsed = Math.floor((totalSecondsElapsed % 3600) / 60);
      const secondsElapsed = totalSecondsElapsed % 60;
      
      setTimeElapsed({
        hours: hoursElapsed,
        minutes: minutesElapsed,
        seconds: secondsElapsed
      });
      
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
      // For visual clarity, cap at 100% for the circle display
      const progressPercentage = Math.min((totalSecondsElapsed / totalFastingSeconds) * 100, 100);
      setProgress(progressPercentage);
      
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [activeFast, currentPeriod]);

  if (!activeFast) {
    return <NoActiveFast />;
  }

  // Get the fasting schedule from current period or use the one from activeFast or default
  const periodsSchedule = currentPeriod?.fastingSchedule;
  const fastingHours = periodsSchedule ? parseInt(periodsSchedule.split(':')[0]) : (activeFast.fastingHours || 16);
  const eatingHours = 24 - fastingHours;
  const fastingSchedule = `${fastingHours}:${eatingHours}`;

  return (
    <Card className="p-6 w-full flex flex-col">
      <div className="flex-1 flex items-center justify-center mb-2">
        <FastingProgressCircle 
          progress={progress} 
          timeElapsed={timeElapsed} 
          timeRemaining={timeRemaining} 
          fastingHours={fastingHours}
          fastingSchedule={fastingSchedule}
        />
      </div>
      
      <div className="mt-auto w-full">
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
