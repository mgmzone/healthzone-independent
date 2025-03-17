
import React from 'react';
import { CardContent } from '@/components/ui/card';

const ChartLoadingState: React.FC = () => {
  return (
    <CardContent className="h-[180px] flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
    </CardContent>
  );
};

export default ChartLoadingState;
