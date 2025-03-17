
import React from 'react';
import { Calendar } from 'lucide-react';
import { Period } from '@/lib/types';
import MultiValueCard from './MultiValueCard';
import { 
  getStartDateFormatted, 
  getEndDateFormatted, 
  getRemainingDaysForDisplay 
} from '../utils/periodUtils';

interface PeriodCardProps {
  currentPeriod?: Period;
  getDaysRemaining: (date: Date, projectedEndDate?: Date | string | undefined) => number;
}

const PeriodCard: React.FC<PeriodCardProps> = ({ currentPeriod, getDaysRemaining }) => {
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
