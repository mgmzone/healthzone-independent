
import React, { ReactElement, JSXElementConstructor } from 'react';
import { ResponsiveContainer } from 'recharts';

interface ChartContainerProps {
  children: ReactElement<any, string | JSXElementConstructor<any>>;
}

const ChartContainer: React.FC<ChartContainerProps> = ({ children }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      {children}
    </ResponsiveContainer>
  );
};

export default ChartContainer;
