
import React from 'react';
import { Button } from '@/components/ui/button';

type ChartView = 'actual' | 'forecast';

interface ViewToggleButtonsProps {
  activeView: ChartView;
  setActiveView: (view: ChartView) => void;
}

const ViewToggleButtons: React.FC<ViewToggleButtonsProps> = ({
  activeView,
  setActiveView,
}) => {
  return (
    <div className="absolute top-0 right-0 z-10 space-x-2">
      <Button 
        variant={activeView === 'actual' ? 'default' : 'outline'} 
        size="sm" 
        onClick={() => setActiveView('actual')}
      >
        Actual
      </Button>
      <Button 
        variant={activeView === 'forecast' ? 'default' : 'outline'} 
        size="sm" 
        onClick={() => setActiveView('forecast')}
      >
        Forecast
      </Button>
    </div>
  );
};

export default ViewToggleButtons;
