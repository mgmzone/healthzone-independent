
import { useState, useEffect } from 'react';
import { differenceInHours, differenceInSeconds } from 'date-fns';

export const useFastingTimeCalculation = (
  startDate: Date, 
  startTime: string, 
  endDate: Date | null, 
  endTime: string,
  isAutoCalculate: boolean
) => {
  const [fastingHours, setFastingHours] = useState<string>("16");
  const [eatingWindowHours, setEatingWindowHours] = useState<string>("8");

  const calculateFastingHours = () => {
    if (!endDate || !endTime || !startDate || !startTime) return;
    
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const startDateTime = new Date(startDate);
    startDateTime.setHours(startHours, startMinutes, 0, 0);
    
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const endDateTime = new Date(endDate);
    endDateTime.setHours(endHours, endMinutes, 0, 0);
    
    if (endDateTime <= startDateTime) return;
    
    const hours = differenceInHours(endDateTime, startDateTime);
    
    const totalSeconds = differenceInSeconds(endDateTime, startDateTime);
    const hourSeconds = hours * 3600;
    const remainingSeconds = totalSeconds - hourSeconds;
    const decimalPart = (remainingSeconds / 3600).toFixed(2).substring(1);
    
    setFastingHours(hours + decimalPart);
    if (isAutoCalculate) {
      setEatingWindowHours((24 - parseFloat(hours + decimalPart)).toFixed(2));
    }
  };

  useEffect(() => {
    if (isAutoCalculate && endDate && endTime) {
      calculateFastingHours();
    }
  }, [startDate, startTime, endDate, endTime, isAutoCalculate]);

  return {
    fastingHours,
    setFastingHours,
    eatingWindowHours,
    setEatingWindowHours,
    calculateFastingHours
  };
};
