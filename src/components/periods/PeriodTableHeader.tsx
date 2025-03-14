
import React from 'react';

const PeriodTableHeader: React.FC = () => {
  return (
    <thead className="bg-muted/50">
      <tr>
        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Date Range</th>
        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Type</th>
        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Start Weight</th>
        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Target Weight</th>
        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Target Loss/Week</th>
        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Current Weight</th>
        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Fasting Schedule</th>
        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Duration</th>
        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Actions</th>
      </tr>
    </thead>
  );
};

export default PeriodTableHeader;
