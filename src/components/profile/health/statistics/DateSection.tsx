
import React from 'react';
import StatisticInput from './StatisticInput';
import { format } from 'date-fns';

interface DateSectionProps {
  currentPeriod?: {
    startDate: string;
    endDate?: string;
  };
}

const DateSection: React.FC<DateSectionProps> = ({ currentPeriod }) => {
  // Format date for display
  const formatDisplayDate = (dateString?: string): string => {
    if (!dateString) return 'Present';
    return format(new Date(dateString), "MM/dd/yyyy");
  };

  if (!currentPeriod) return null;

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
        value={formatDisplayDate(currentPeriod.endDate)}
      />
    </>
  );
};

export default DateSection;
