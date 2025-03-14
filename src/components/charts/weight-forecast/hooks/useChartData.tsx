
import { useState, useEffect } from 'react';
import { WeighIn, Period } from '@/lib/types';
import { 
  calculateChartData, 
  calculateWeightRange
} from '../weightForecastUtils';
import { WeeklyWeightData, ProjectionResult } from '../utils/types';

export function useChartData(
  weighIns: WeighIn[], 
  currentPeriod: Period | undefined,
  isImperial: boolean
) {
  const [chartData, setChartData] = useState<WeeklyWeightData[]>([]);
  const [trendLineData, setTrendLineData] = useState<WeeklyWeightData[]>([]);
  const [goalLineData, setGoalLineData] = useState<WeeklyWeightData[]>([]);
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [minWeight, setMinWeight] = useState<number>(0);
  const [maxWeight, setMaxWeight] = useState<number>(0);

  useEffect(() => {
    const generateChartData = async () => {
      if (!weighIns.length || !currentPeriod) {
        setLoading(false);
        return;
      }

      try {
        // Calculate total weeks for the period
        const startDate = new Date(currentPeriod.startDate);
        const endDate = new Date(currentPeriod.endDate);
        const totalWeeks = Math.ceil((endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 8; // Add buffer weeks

        // Sort weighIns by date (most recent first)
        const sortedWeighIns = [...weighIns].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        if (sortedWeighIns.length === 0) {
          setLoading(false);
          return;
        }

        // Get the most recent weight
        const latestWeighIn = sortedWeighIns[0];
        const startWeight = currentPeriod.startWeight || sortedWeighIns[sortedWeighIns.length - 1].weight;
        const targetWeight = currentPeriod.targetWeight || startWeight;

        // Calculate chart data with projection
        const projectionResult: ProjectionResult = await calculateChartData(
          sortedWeighIns,
          startWeight,
          targetWeight,
          startDate,
          totalWeeks,
          isImperial
        );

        // Generate trend line data - a simple line from start to goal
        const createTrendLine = () => {
          const firstPoint = projectionResult.chartData[0];
          const lastPoint = projectionResult.chartData[projectionResult.chartData.length - 1];
          
          if (!firstPoint || !lastPoint) return [];
          
          // Generate a linear trend line connecting start to target
          const startPoint = {
            week: firstPoint.week,
            date: firstPoint.date,
            weight: startWeight,
            isProjected: false
          };
          
          const endPoint = {
            week: lastPoint.week,
            date: lastPoint.date,
            weight: targetWeight,
            isProjected: true
          };
          
          // Calculate intermediate points
          const trendLine = [startPoint];
          const totalPoints = 10; // Number of points in the trend line
          
          for (let i = 1; i < totalPoints - 1; i++) {
            const ratio = i / totalPoints;
            const weekDiff = endPoint.week - startPoint.week;
            const weightDiff = endPoint.weight - startPoint.weight;
            
            // Calculate intermediate date
            const startTime = new Date(startPoint.date).getTime();
            const endTime = new Date(endPoint.date).getTime();
            const timeDiff = endTime - startTime;
            
            trendLine.push({
              week: startPoint.week + ratio * weekDiff,
              date: new Date(startTime + ratio * timeDiff),
              weight: startPoint.weight + ratio * weightDiff,
              isProjected: true
            });
          }
          
          trendLine.push(endPoint);
          return trendLine;
        };
        
        // Generate goal line data - a horizontal line at target weight
        const createGoalLine = () => {
          const allDates = projectionResult.chartData.map(point => point.date);
          
          return allDates.map((date, index) => ({
            week: index,
            date: date,
            weight: targetWeight,
            isProjected: true
          }));
        };

        // Calculate appropriate min/max for the chart
        const { minWeight: calculatedMin, maxWeight: calculatedMax } = calculateWeightRange(
          projectionResult.chartData,
          targetWeight
        );

        // Set all the state variables
        setChartData(projectionResult.chartData);
        setTrendLineData(createTrendLine());
        setGoalLineData(createGoalLine());
        setTargetDate(projectionResult.targetDate);
        setMinWeight(calculatedMin);
        setMaxWeight(calculatedMax);
        setError(null);
      } catch (err) {
        console.error('Error generating weight forecast:', err);
        setError('Failed to generate weight forecast. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    generateChartData();
  }, [weighIns, currentPeriod, isImperial]);

  return {
    chartData,
    trendLineData,
    goalLineData,
    targetDate,
    loading,
    error,
    minWeight,
    maxWeight
  };
}
