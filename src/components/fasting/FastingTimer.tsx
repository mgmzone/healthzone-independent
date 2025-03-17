
import React from 'react';
import { Card } from "@/components/ui/card";
import { FastingLog } from '@/lib/types';
import FastingProgressCircle from './timer/FastingProgressCircle';
import FastingTimeInfo from './timer/FastingTimeInfo';
import FastingTips from './timer/FastingTips';
import NoActiveFast from './timer/NoActiveFast';
import { usePeriodsData } from '@/hooks/usePeriodsData';
import { useFastingTimeCalculation } from '@/hooks/useFastingTimeCalculation';

interface FastingTimerProps {
  activeFast: FastingLog | null;
  onEndFast: () => void;
}

const FastingTimer: React.FC<FastingTimerProps> = ({ activeFast, onEndFast }) => {
  const { getCurrentPeriod } = usePeriodsData();
  const currentPeriod = getCurrentPeriod();
  
  // Get fasting hours from current period or use default
  const fastingHours = activeFast && 
                      (currentPeriod?.fastingSchedule ? 
                        parseInt(currentPeriod.fastingSchedule.split(':')[0]) : 
                        (activeFast.fastingHours || 16));
  
  // Use the new hook for time calculations
  const { timeElapsed, timeRemaining, progress } = useFastingTimeCalculation(
    activeFast ? new Date(activeFast.startTime) : null,
    fastingHours
  );

  if (!activeFast) {
    return <NoActiveFast />;
  }

  // Calculate fasting schedule
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
