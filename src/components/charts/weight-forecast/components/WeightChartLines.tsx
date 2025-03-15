
import React from 'react';
import { Line } from 'recharts';

interface WeightChartLinesProps {
  actualData: any[];
  forecastData: any[];
  targetLine: any[];
  activeView: 'actual' | 'forecast';
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

  const hasTargetLine = activeView === 'forecast' && targetLine && targetLine.length > 0;
  const hasActualData = actualData && actualData.length > 0;
  const hasForecastData = activeView === 'forecast' && forecastData && forecastData.length > 0;

  return (
    <>
      {/* Target Weight Line (Dashed Orange) - Shows the ideal weight loss path */}
      {hasTargetLine && (
        <Line 
          key="target-line"
          type="monotone" 
          dataKey="weight"
          data={targetLine}
          stroke="#FF9966"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          dot={false}
          activeDot={false}
          name="Target Path"
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
          stroke="#0066CC" 
          strokeWidth={2}
          activeDot={{ r: 6, fill: '#0066CC', stroke: '#fff', strokeWidth: 2 }}
          dot={{ 
            r: 4, 
            fill: '#0066CC',
            stroke: '#fff',
            strokeWidth: 1
          }}
          isAnimationActive={false}
          name="Actual Weight"
        />
      )}
      
      {/* Forecast Weight Line (Blue Dashed) - Only visible in forecast view */}
      {hasForecastData && (
        <Line
          key="forecast-line"
          type="monotone"
          dataKey="weight"
          data={forecastData}
          stroke="#0066CC"
          strokeWidth={2}
          strokeDasharray="5 5"
          activeDot={false}
          dot={false}
          name="Forecast"
          isAnimationActive={false}
        />
      )}
    </>
  );
};

export default WeightChartLines;
