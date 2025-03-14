
import React from 'react';
import { Line } from 'recharts';

interface ChartLinesProps {
  actualData: any[];
  forecastData: any[];
  targetLine: any[];
  activeView: 'actual' | 'forecast';
}

const ChartLines: React.FC<ChartLinesProps> = ({
  actualData,
  forecastData,
  targetLine,
  activeView
}) => {
  console.log('ChartLines rendering with:', {
    actualDataCount: actualData.length,
    forecastDataCount: forecastData.length,
    targetLineCount: targetLine.length,
    activeView,
    actualFirstPoint: actualData.length > 0 ? actualData[0] : null,
    forecastFirstPoint: forecastData.length > 0 ? forecastData[0] : null,
    targetFirstPoint: targetLine.length > 0 ? targetLine[0] : null
  });

  return (
    <>
      {/* Target Weight Line (Dashed Orange) - Shows the ideal weight loss path */}
      {activeView === 'forecast' && targetLine.length > 0 && (
        <Line 
          type="linear" 
          dataKey="weight"
          data={targetLine}
          stroke="#FF9966"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          dot={false}
          activeDot={false}
          name="Target Path"
          connectNulls={true}
          isAnimationActive={false}
        />
      )}
      
      {/* Actual Weight Line (Blue) - Always visible with dots */}
      <Line 
        type="linear" 
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
        connectNulls={true}
      />
      
      {/* Forecast Weight Line (Blue Dashed) - Only visible in forecast view */}
      {activeView === 'forecast' && forecastData.length > 0 && (
        <Line
          type="linear"
          dataKey="weight"
          data={forecastData}
          stroke="#0066CC"
          strokeWidth={2}
          strokeDasharray="5 5"
          activeDot={false}
          dot={false}
          name="Forecast"
          isAnimationActive={false}
          connectNulls={true}
        />
      )}
    </>
  );
};

export default ChartLines;
