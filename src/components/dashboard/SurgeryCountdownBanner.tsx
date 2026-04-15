import React from 'react';
import { CalendarClock } from 'lucide-react';

interface SurgeryCountdownBannerProps {
  surgeryDate?: string; // YYYY-MM-DD
}

const SurgeryCountdownBanner: React.FC<SurgeryCountdownBannerProps> = ({ surgeryDate }) => {
  if (!surgeryDate) return null;

  // Append T12:00:00 to avoid UTC-midnight timezone shift per project convention
  const surgery = new Date(`${surgeryDate}T12:00:00`);
  if (isNaN(surgery.getTime())) return null;

  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const msPerDay = 1000 * 60 * 60 * 24;
  const days = Math.round((surgery.getTime() - today.getTime()) / msPerDay);

  const formatted = surgery.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  let headline: string;
  let tone: string;
  if (days > 1) {
    headline = `${days} days until surgery`;
    tone = 'bg-blue-50 border-blue-200 text-blue-900';
  } else if (days === 1) {
    headline = 'Surgery is tomorrow';
    tone = 'bg-amber-50 border-amber-200 text-amber-900';
  } else if (days === 0) {
    headline = 'Surgery is today';
    tone = 'bg-amber-100 border-amber-300 text-amber-900';
  } else {
    const daysSince = Math.abs(days);
    headline = `${daysSince} day${daysSince === 1 ? '' : 's'} post-surgery`;
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

export default SurgeryCountdownBanner;
