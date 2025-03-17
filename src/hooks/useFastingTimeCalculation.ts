
import { useState, useEffect } from 'react';
import { differenceInSeconds } from 'date-fns';

interface TimeData {
  hours: number;
  minutes: number;
  seconds: number;
}

export const useFastingTimeCalculation = (
  startTime: Date | null,
  targetFastingHours: number
) => {
  const [timeElapsed, setTimeElapsed] = useState<TimeData>({ hours: 0, minutes: 0, seconds: 0 });
  const [timeRemaining, setTimeRemaining] = useState<TimeData>({ hours: 0, minutes: 0, seconds: 0 });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!startTime) return;
    
    const intervalId = setInterval(() => {
      const now = new Date();
      const start = new Date(startTime);
      const totalFastingSeconds = targetFastingHours * 3600;
      
      // Calculate elapsed time
      const totalSecondsElapsed = differenceInSeconds(now, start);
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
      // For visual clarity, cap at 100% for the circle display
      const progressPercentage = Math.min((totalSecondsElapsed / totalFastingSeconds) * 100, 100);
      setProgress(progressPercentage);
      
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [startTime, targetFastingHours]);

  return {
    timeElapsed,
    timeRemaining,
    progress
  };
};
