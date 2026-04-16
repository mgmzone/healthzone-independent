
import React from 'react';
import { EmailType } from '@/lib/services/emailService';

// Component to display placeholders help
const PlaceholdersHelp: React.FC<{ type: EmailType }> = ({ type }) => {
  const commonPlaceholders = [
    { name: 'name', description: "User's first name" },
    { name: 'appUrl', description: 'Application URL (e.g. https://healthzone.mgm.zone)' },
    { name: 'unsubscribeUrl', description: 'One-click unsubscribe link (required for deliverability)' },
  ];

  const specificPlaceholders = {
    'weekly_summary': [
      { name: 'statsGridHtml', description: 'Pre-rendered HTML block with weigh-in / workout / fasting counts' },
      { name: 'nutritionHtml', description: 'Pre-rendered HTML block with protein, macros (if logged), and goal compliance' },
      { name: 'aiSectionHtml', description: 'Pre-rendered AI Coach Insights block (empty string if the user has no Claude key)' },
      { name: 'weighIns', description: 'Weigh-in count (number)' },
      { name: 'fastingDays', description: 'Fasting session count (number)' },
      { name: 'exercises', description: 'Exercise session count (number)' },
      { name: 'mealsLogged', description: 'Meals logged (number)' },
      { name: 'avgDailyProtein', description: 'Average daily protein in grams' },
      { name: 'avgDailyCarbs', description: 'Average daily carbs in grams' },
      { name: 'avgDailyFat', description: 'Average daily fat in grams' },
      { name: 'avgDailySodium', description: 'Average daily sodium in mg' },
      { name: 'avgDailyCalories', description: 'Average daily calories' },
      { name: 'irritantViolations', description: 'Irritant violation count' },
      { name: 'goalCompliance', description: 'Daily goal compliance (%)' },
      { name: 'aiSummary', description: "AI coach summary sentence (empty if user has no Claude key)" },
      { name: 'aiTip', description: "AI coach tip (empty if user has no Claude key)" },
    ],
    'profile_completion': [],
    'inactivity_reminder': [
      { name: 'daysInactive', description: 'Number of days since the user last logged anything' },
    ],
    'welcome': [],
    'milestone_reminder': [
      { name: 'milestoneName', description: 'The milestone name (e.g. "Surgery", "Race day")' },
      { name: 'milestoneDateFormatted', description: 'Full formatted date of the milestone' },
      { name: 'countdownLabel', description: 'Short label ("1 week until" or "Tomorrow:")' },
      { name: 'daysUntil', description: 'Number of days until the milestone (7 or 1)' },
    ]
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
