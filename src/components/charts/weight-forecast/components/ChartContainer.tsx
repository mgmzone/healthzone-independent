
import React, { ReactNode } from 'react';
import { ResponsiveContainer } from 'recharts';

interface ChartContainerProps {
  children: ReactNode;
}

const ChartContainer: React.FC<ChartContainerProps> = ({ children }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      {children}
    </ResponsiveContainer>
  );
};

export default ChartContainer;
