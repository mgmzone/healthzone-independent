
import { useState, useEffect } from 'react';
import { WeighIn, Period } from '@/lib/types';
import { WeeklyWeightData } from '../utils/types';
import { calculateChartData, calculateWeightRange } from '../weightForecastUtils';

export const useChartData = (
  weighIns: WeighIn[],
  currentPeriod: Period | undefined,
  isImperial: boolean
) => {
  const [chartData, setChartData] = useState<WeeklyWeightData[]>([]);
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const { chartData: newChartData, targetDate: newTargetDate } = 
          await calculateChartData(weighIns, currentPeriod, isImperial);
        
        setChartData(newChartData);
        setTargetDate(newTargetDate);
        setError(null);
      } catch (err) {
        console.error('Error calculating weight forecast:', err);
        setError('Failed to calculate weight forecast');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [weighIns, currentPeriod, isImperial]);
  
  const calculateChartRange = () => {
    if (!currentPeriod) return { minWeight: 0, maxWeight: 100 };
    
    const { minWeight, maxWeight } = calculateWeightRange(chartData);
    
    return { minWeight, maxWeight };
  };
  
  const { minWeight, maxWeight } = calculateChartRange();
  
  return {
    chartData,
    targetDate,
    loading,
    error,
    minWeight,
    maxWeight
  };
};
