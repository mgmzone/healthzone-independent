
// This file is no longer needed as we've simplified our chart approach
// Axes are now defined directly in the WeightForecastChart component

import React from 'react';
import { XAxis, YAxis, CartesianGrid } from 'recharts';
import { format } from 'date-fns';

export const createDateFormatter = () => {
  return (date: Date): string => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return '';
    }
    return format(date, 'MMM yyyy');
  };
};
