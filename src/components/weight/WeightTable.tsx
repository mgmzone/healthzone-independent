
import React from 'react';
import { format } from 'date-fns';
import { WeighIn } from '@/lib/types';

interface WeightTableProps {
  weighIns: WeighIn[];
  isImperial: boolean;
}

const WeightTable: React.FC<WeightTableProps> = ({ weighIns, isImperial }) => {
  // Convert weight if needed based on measurement unit
  const convertWeight = (weight: number | undefined) => {
    if (!weight) return '-';
    return isImperial ? (weight * 2.20462).toFixed(1) : weight.toFixed(1);
  };

  const convertMuscleOrBoneMass = (mass: number | undefined) => {
    if (!mass) return '-';
    return isImperial ? (mass * 2.20462).toFixed(1) : mass.toFixed(1);
  };

  const formatPercentage = (value: number | undefined) => {
    if (!value) return '-';
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="min-w-full divide-y divide-gray-200">
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
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {weighIns.map((entry) => (
            <tr key={entry.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {format(new Date(entry.date), 'MMM d, yyyy')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {convertWeight(entry.weight)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {entry.bmi ? entry.bmi.toFixed(1) : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatPercentage(entry.bodyFatPercentage)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {convertMuscleOrBoneMass(entry.skeletalMuscleMass)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {convertMuscleOrBoneMass(entry.boneMass)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatPercentage(entry.bodyWaterPercentage)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WeightTable;
