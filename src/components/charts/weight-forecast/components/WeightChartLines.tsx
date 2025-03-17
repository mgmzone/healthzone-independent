
import React from 'react';
import { Line } from 'recharts';

interface WeightChartLinesProps {
  actualData: any[];
  forecastData: any[];
  targetLine: any[];
  activeView: 'forecast';
}

const WeightChartLines: React.FC<WeightChartLinesProps> = ({
  actualData,
  forecastData,
  targetLine,
  activeView
}) => {
  console.log('WeightChartLines rendering:', {
    actualDataCount: actualData?.length || 0,
    forecastDataCount: forecastData?.length || 0,
    targetLineCount: targetLine?.length || 0,
    activeView,
    actualDataSample: actualData?.[0],
    forecastDataSample: forecastData?.[0],
    targetLineSample: targetLine?.[0]
  });

  const hasTargetLine = targetLine && targetLine.length > 0;
  const hasActualData = actualData && actualData.length > 0;
  const hasForecastData = forecastData && forecastData.length > 0;

  return (
    <>
      {/* Reference line for target weight (Light Blue Dashed) */}
      {hasTargetLine && (
        <Line 
          key="target-line"
          type="monotone" 
          dataKey="weight"
          data={targetLine}
          stroke="#A5D8FF"
          strokeWidth={1}
          strokeDasharray="3 3"
          dot={false}
          activeDot={false}
          name="Target Weight"
          isAnimationActive={false}
        />
      )}
      
      {/* Actual Weight Line (Blue) - Always visible with dots */}
      {hasActualData && (
        <Line 
          key="actual-line"
          type="monotone" 
          dataKey="weight" 
          data={actualData}
          stroke="#0EA5E9" 
          strokeWidth={2.5}
          activeDot={{ r: 6, fill: '#0EA5E9', stroke: '#fff', strokeWidth: 2 }}
          dot={{ 
            r: 4, 
            fill: '#0EA5E9',
            stroke: '#fff',
            strokeWidth: 1
          }}
          isAnimationActive={false}
          name="Actual Weight"
        />
      )}
      
      {/* Forecast Weight Line (Orange Dashed) - Only visible in forecast view */}
      {hasForecastData && activeView === 'forecast' && (
        <Line
          key="forecast-line"
          type="monotone"
          dataKey="weight"
          data={forecastData}
          stroke="#F97316"
          strokeWidth={2}
          strokeDasharray="5 5"
          activeDot={{ r: 4, fill: '#F97316', stroke: '#fff', strokeWidth: 1 }}
          dot={false}
          name="Projected Loss"
          isAnimationActive={false}
        />
      )}
    </>
  );
};

export default WeightChartLines;
