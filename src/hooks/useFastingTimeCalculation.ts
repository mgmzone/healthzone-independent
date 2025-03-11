
import { useState, useEffect } from 'react';
import { differenceInHours, differenceInSeconds } from 'date-fns';
import { calculateEatingWindowHours } from '@/components/fasting/utils/fastingUtils';

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
    
    const totalSeconds = differenceInSeconds(endDateTime, startDateTime);
    const hours = totalSeconds / 3600;
    const hoursFormatted = hours.toFixed(2);
    
    setFastingHours(hoursFormatted);
    if (isAutoCalculate) {
      const calculatedEatingHours = calculateEatingWindowHours(parseFloat(hoursFormatted));
      setEatingWindowHours(calculatedEatingHours.toFixed(2));
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
