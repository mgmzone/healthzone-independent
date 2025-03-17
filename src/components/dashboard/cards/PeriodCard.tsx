
import React from 'react';
import { Calendar } from 'lucide-react';
import { Period } from '@/lib/types';
import MultiValueCard from './MultiValueCard';
import ProgressCircle from '@/components/ProgressCircle';
import { 
  getStartDateFormatted, 
  getEndDateFormatted, 
  getRemainingDaysForDisplay 
} from '../utils/periodUtils';

interface PeriodCardProps {
  currentPeriod?: Period;
  getDaysRemaining: (date: Date, projectedEndDate?: Date | string | undefined) => number;
  timeProgress?: number;
  daysRemaining?: number;
  showProgressCircle?: boolean;
}

const PeriodCard: React.FC<PeriodCardProps> = ({ 
  currentPeriod, 
  getDaysRemaining,
  timeProgress = 0,
  daysRemaining = 0,
  showProgressCircle = false
}) => {
  const getPeriodValues = () => {
    const values = [];
    
    values.push({
      label: "Start Date",
      value: getStartDateFormatted(currentPeriod)
    });
    
    if (currentPeriod && (currentPeriod.projectedEndDate || currentPeriod.endDate)) {
      values.push({
        label: "End Date",
        value: getEndDateFormatted(currentPeriod)
      });
    }
    
    values.push({
      label: "Remaining",
      value: getRemainingDaysForDisplay(currentPeriod, getDaysRemaining)
    });
    
    return values;
  };

  if (showProgressCircle) {
    return (
      <MultiValueCard
        title="Active Period"
        values={getPeriodValues()}
        icon={Calendar}
        color="#f5a742"
        footer={
          <div className="mt-4 flex justify-center">
            <ProgressCircle 
              value={timeProgress} 
              showPercentage={true}
              valueLabel={`${daysRemaining} days left`}
              size={120}
              strokeWidth={10}
            />
          </div>
        }
      />
    );
  }

  return (
    <MultiValueCard
      title="Active Period"
      values={getPeriodValues()}
      icon={Calendar}
      color="#f5a742"
    />
  );
};

export default PeriodCard;
