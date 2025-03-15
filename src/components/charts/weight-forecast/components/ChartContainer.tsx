
import React, { ReactElement, JSXElementConstructor } from 'react';
import { ResponsiveContainer } from 'recharts';

interface ChartContainerProps {
  children: ReactElement<any, string | JSXElementConstructor<any>>;
}

const ChartContainer: React.FC<ChartContainerProps> = ({ children }) => {
  console.log('ChartContainer rendering with child type:', 
    typeof children.type === 'string' ? children.type : (children.type as any).displayName || 'Unknown');
  
  return (
    <div className="w-full h-full bg-background">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
};

export default ChartContainer;
