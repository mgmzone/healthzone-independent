
import { useState, useEffect } from 'react';
import { format, differenceInHours, differenceInMinutes } from 'date-fns';

export const useFastingEntryCalculation = (
  startDate: Date, 
  startTime: string, 
  endDate: Date | null, 
  endTime: string, 
  isAutoCalculate: boolean
) => {
  const [fastingHours, setFastingHours] = useState<string>("16");
  const [eatingWindowHours, setEatingWindowHours] = useState<string>("8");

  // Calculate fasting hours between start and end times
  const calculateFastingHours = () => {
    if (!startDate || !endDate || !startTime || !endTime) return;

    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    const start = new Date(startDate);
    start.setHours(startHours, startMinutes, 0, 0);

    const end = new Date(endDate);
    end.setHours(endHours, endMinutes, 0, 0);

    // Calculate difference in hours accounting for minutes
    const hoursDiff = differenceInHours(end, start);
    const minutesDiff = differenceInMinutes(end, start) % 60;
    const totalHours = hoursDiff + (minutesDiff / 60);

    return totalHours.toFixed(2);
  };

  // Update fasting hours when dates/times change and auto-calculate is enabled
  useEffect(() => {
    if (isAutoCalculate && startDate && endDate && startTime && endTime) {
      const hours = calculateFastingHours();
      if (hours) {
        setFastingHours(hours);
        const eating = (24 - parseFloat(hours)).toFixed(2);
        setEatingWindowHours(eating);
      }
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
