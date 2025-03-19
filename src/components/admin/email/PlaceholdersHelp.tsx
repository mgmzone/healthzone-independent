
import React from 'react';
import { EmailType } from '@/lib/services/emailService';

// Component to display placeholders help
const PlaceholdersHelp: React.FC<{ type: EmailType }> = ({ type }) => {
  const commonPlaceholders = [
    { name: 'name', description: 'User\'s name' },
    { name: 'appUrl', description: 'Application URL' },
  ];

  const specificPlaceholders = {
    'weekly_summary': [
      { name: 'weighIns', description: 'Number of weight entries' },
      { name: 'fastingDays', description: 'Number of fasting days' },
      { name: 'exercises', description: 'Number of exercise entries' },
    ],
    'profile_completion': [],
    'inactivity_reminder': []
  };

  const placeholders = [...commonPlaceholders, ...(specificPlaceholders[type] || [])];

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-md">
      <h4 className="text-sm font-medium mb-2">Available placeholders:</h4>
      <ul className="space-y-1 text-sm">
        {placeholders.map((p) => (
          <li key={p.name}>
            <code className="bg-gray-200 px-1 py-0.5 rounded">{'{{' + p.name + '}}'}</code> - {p.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlaceholdersHelp;
