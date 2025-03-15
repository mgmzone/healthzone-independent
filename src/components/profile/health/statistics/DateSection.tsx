
import React from 'react';
import StatisticInput from './StatisticInput';
import { format } from 'date-fns';

interface DateSectionProps {
  currentPeriod?: {
    startDate: string;
    endDate?: string;
    projectedEndDate?: string;
  };
}

const DateSection: React.FC<DateSectionProps> = ({ currentPeriod }) => {
  // Format date for display
  const formatDisplayDate = (dateString?: string): string => {
    if (!dateString) return 'Present';
    return format(new Date(dateString), "MM/dd/yyyy");
  };

  if (!currentPeriod) return null;

  // Prefer projected end date if available, otherwise fall back to regular end date
  const endDateToDisplay = currentPeriod.projectedEndDate || currentPeriod.endDate;

  return (
    <>
      <StatisticInput
        id="startDate"
        label="Session Start Date"
        value={formatDisplayDate(currentPeriod.startDate)}
      />
      <StatisticInput
        id="endDate"
        label="Session End Date"
        value={formatDisplayDate(endDateToDisplay)}
      />
    </>
  );
};

export default DateSection;
