import React from 'react';
import { CalendarClock, Sparkles } from 'lucide-react';

interface PriorityMilestoneBannerProps {
  name?: string;
  date?: string; // YYYY-MM-DD
}

// Urgency-driven style tokens. Cool → warm → alert as the day approaches.
function styleForDays(days: number) {
  if (days > 30) {
    return {
      gradient: 'from-blue-500/10 via-indigo-500/10 to-purple-500/10',
      border: 'border-blue-200/60 dark:border-blue-800/60',
      text: 'text-blue-900 dark:text-blue-100',
      iconBg: 'bg-blue-500/15',
      iconColor: 'text-blue-500',
      pulse: '',
    };
  }
  if (days > 14) {
    return {
      gradient: 'from-indigo-500/15 via-violet-500/15 to-pink-500/10',
      border: 'border-indigo-200/70 dark:border-indigo-800/70',
      text: 'text-indigo-900 dark:text-indigo-100',
      iconBg: 'bg-indigo-500/15',
      iconColor: 'text-indigo-500',
      pulse: '',
    };
  }
  if (days > 3) {
    return {
      gradient: 'from-amber-500/15 via-orange-500/15 to-pink-500/10',
      border: 'border-amber-200/70 dark:border-amber-800/70',
      text: 'text-amber-900 dark:text-amber-100',
      iconBg: 'bg-amber-500/15',
      iconColor: 'text-amber-600',
      pulse: '',
    };
  }
  if (days > 0) {
    return {
      gradient: 'from-rose-500/20 via-red-500/20 to-orange-500/15',
      border: 'border-rose-300/80 dark:border-rose-700/80',
      text: 'text-rose-900 dark:text-rose-100',
      iconBg: 'bg-rose-500/20',
      iconColor: 'text-rose-600',
      pulse: 'animate-pulse',
    };
  }
  if (days === 0) {
    return {
      gradient: 'from-rose-500/30 via-red-500/30 to-orange-500/20',
      border: 'border-rose-400 dark:border-rose-600',
      text: 'text-rose-900 dark:text-rose-100',
      iconBg: 'bg-rose-500/30',
      iconColor: 'text-rose-600',
      pulse: 'animate-pulse',
    };
  }
  // Post-milestone celebration
  return {
    gradient: 'from-emerald-500/15 via-green-500/15 to-teal-500/10',
    border: 'border-emerald-200/70 dark:border-emerald-800/70',
    text: 'text-emerald-900 dark:text-emerald-100',
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-500',
    pulse: '',
  };
}

const PriorityMilestoneBanner: React.FC<PriorityMilestoneBannerProps> = ({ name, date }) => {
  if (!date || !name) return null;

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
  if (days > 1) {
    headline = `${days} days until ${name}`;
  } else if (days === 1) {
    headline = `${name} is tomorrow`;
  } else if (days === 0) {
    headline = `${name} is today`;
  } else {
    const daysSince = Math.abs(days);
    headline = `${daysSince} day${daysSince === 1 ? '' : 's'} since ${name}`;
  }

  const s = styleForDays(days);
  const isCelebration = days < 0;
  const Icon = isCelebration ? Sparkles : CalendarClock;

  return (
    <div
      className={`mb-4 relative overflow-hidden rounded-xl border ${s.border} bg-gradient-to-r ${s.gradient} px-5 py-4 transition-all`}
    >
      <div className="flex items-center gap-4">
        <div className={`rounded-full p-2.5 ${s.iconBg} ${s.pulse}`}>
          <Icon className={`h-5 w-5 ${s.iconColor}`} />
        </div>
        <div className={`flex-1 ${s.text}`}>
          <div className="text-base font-semibold tracking-tight">{headline}</div>
          <div className="text-xs opacity-80 mt-0.5">{formatted}</div>
        </div>
        {days > 0 && days <= 30 && (
          <div className={`text-right ${s.text}`}>
            <div className="text-3xl font-bold leading-none tabular-nums">{days}</div>
            <div className="text-xs opacity-70 mt-0.5">{days === 1 ? 'day left' : 'days left'}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriorityMilestoneBanner;
