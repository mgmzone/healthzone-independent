
import React from 'react';

interface WeightTableHeaderProps {
  isImperial: boolean;
  showActions: boolean;
}

const WeightTableHeader: React.FC<WeightTableHeaderProps> = ({ 
  isImperial, 
  showActions 
}) => {
  return (
    <thead className="bg-gray-50">
      <tr>
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Date
        </th>
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Weight ({isImperial ? 'lbs' : 'kg'})
        </th>
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          BMI
        </th>
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Body Fat
        </th>
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Muscle ({isImperial ? 'lbs' : 'kg'})
        </th>
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Bone ({isImperial ? 'lbs' : 'kg'})
        </th>
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Water
        </th>
        {showActions && (
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        )}
      </tr>
    </thead>
  );
};

export default WeightTableHeader;
