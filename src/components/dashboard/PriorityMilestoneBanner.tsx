import React from 'react';
import { CalendarClock } from 'lucide-react';

interface PriorityMilestoneBannerProps {
  name?: string;
  date?: string; // YYYY-MM-DD
}

const PriorityMilestoneBanner: React.FC<PriorityMilestoneBannerProps> = ({ name, date }) => {
  if (!date || !name) return null;

  // Append T12:00:00 to avoid UTC-midnight timezone shift per project convention
  const milestoneDate = new Date(`${date}T12:00:00`);
  if (isNaN(milestoneDate.getTime())) return null;

  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const msPerDay = 1000 * 60 * 60 * 24;
  const days = Math.round((milestoneDate.getTime() - today.getTime()) / msPerDay);

  const formatted = milestoneDate.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  let headline: string;
  let tone: string;
  if (days > 1) {
    headline = `${days} days until ${name}`;
    tone = 'bg-blue-50 border-blue-200 text-blue-900';
  } else if (days === 1) {
    headline = `${name} is tomorrow`;
    tone = 'bg-amber-50 border-amber-200 text-amber-900';
  } else if (days === 0) {
    headline = `${name} is today`;
    tone = 'bg-amber-100 border-amber-300 text-amber-900';
  } else {
    const daysSince = Math.abs(days);
    headline = `${daysSince} day${daysSince === 1 ? '' : 's'} since ${name}`;
    tone = 'bg-green-50 border-green-200 text-green-900';
  }

  return (
    <div className={`mb-4 flex items-center gap-3 rounded-lg border px-4 py-3 ${tone}`}>
      <CalendarClock className="h-5 w-5 shrink-0" />
      <div>
        <div className="text-sm font-semibold">{headline}</div>
        <div className="text-xs opacity-80">{formatted}</div>
      </div>
    </div>
  );
};

export default PriorityMilestoneBanner;
