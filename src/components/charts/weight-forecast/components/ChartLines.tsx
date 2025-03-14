
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
  // Process data to ensure dates are in timestamp format
  const processData = (data: any[]) => {
    return data.map(point => {
      const date = point.date instanceof Date 
        ? point.date.getTime() 
        : (typeof point.date === 'object' && point.date?._type === 'Date') 
          ? point.date.value.value 
          : new Date(point.date).getTime();
          
      return {
        ...point,
        date
      };
    });
  };

  const processedActualData = processData(actualData);
  const processedForecastData = processData(forecastData);
  const processedTargetLine = processData(targetLine);

  console.log('ChartLines rendering with:', {
    actualDataCount: processedActualData.length,
    forecastDataCount: processedForecastData.length,
    targetLineCount: processedTargetLine.length,
    activeView,
    actualFirstPoint: processedActualData.length > 0 ? processedActualData[0] : null,
    forecastFirstPoint: processedForecastData.length > 0 ? processedForecastData[0] : null,
    targetFirstPoint: processedTargetLine.length > 0 ? processedTargetLine[0] : null
  });

  return (
    <>
      {/* Target Weight Line (Dashed Orange) - Shows the ideal weight loss path */}
      {activeView === 'forecast' && processedTargetLine.length > 0 && (
        <Line 
          type="linear" 
          dataKey="weight"
          data={processedTargetLine}
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
        data={processedActualData}
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
      {activeView === 'forecast' && processedForecastData.length > 0 && (
        <Line
          type="linear"
          dataKey="weight"
          data={processedForecastData}
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
