
import React from 'react';

const thClass =
  'px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider';

const FastingTableHeader: React.FC = () => {
  return (
    <thead className="bg-muted/40">
      <tr>
        <th scope="col" className={thClass}>Date</th>
        <th scope="col" className={thClass}>Day</th>
        <th scope="col" className={thClass}>Start Time</th>
        <th scope="col" className={thClass}>End Time</th>
        <th scope="col" className={thClass}>Duration</th>
        <th scope="col" className={thClass}>Eating Window</th>
        <th scope="col" className={thClass}>Completed</th>
        <th scope="col" className={thClass}>Actions</th>
      </tr>
    </thead>
  );
};

export default FastingTableHeader;
