
import React from 'react';

const PeriodTableHeader: React.FC = () => {
  return (
    <thead className="bg-muted/50">
      <tr>
        <th className="px-4 py-3 text-left">Date Range</th>
        <th className="px-4 py-3 text-left">Type</th>
        <th className="px-4 py-3 text-center">Start Weight</th>
        <th className="px-4 py-3 text-center">Target Weight</th>
        <th className="px-4 py-3 text-center">Target Loss/Week</th>
        <th className="px-4 py-3 text-center">Current Weight</th>
        <th className="px-4 py-3 text-center">Fasting Schedule</th>
        <th className="px-4 py-3 text-center">Duration</th>
        <th className="px-4 py-3 text-center">Actions</th>
      </tr>
    </thead>
  );
};

export default PeriodTableHeader;
