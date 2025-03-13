
import React from 'react';

const PeriodTableHeader: React.FC = () => {
  return (
    <thead>
      <tr className="bg-muted/50">
        <th className="px-4 py-3 text-left">Period</th>
        <th className="px-4 py-3 text-left">Type</th>
        <th className="px-4 py-3 text-center">Start Weight</th>
        <th className="px-4 py-3 text-center">Target Weight</th>
        <th className="px-4 py-3 text-center">Current Weight</th>
        <th className="px-4 py-3 text-center">Fasting</th>
        <th className="px-4 py-3 text-center">Duration</th>
        <th className="px-4 py-3 text-center">Actions</th>
      </tr>
    </thead>
  );
};

export default PeriodTableHeader;
