
import React, { ReactNode } from 'react';
import { Card } from '@/components/ui/card';

interface ActivitySummaryContainerProps {
  title: string;
  children: ReactNode;
}

const ActivitySummaryContainer: React.FC<ActivitySummaryContainerProps> = ({
  title,
  children
}) => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="h-72">
        {children}
      </div>
    </Card>
  );
};

export default ActivitySummaryContainer;
