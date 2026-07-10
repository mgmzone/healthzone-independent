import React from 'react';
import { Link } from 'react-router-dom';
import { ListChecks } from 'lucide-react';
import MultiValueCard from './MultiValueCard';
import { useDailyTracking } from '@/hooks/useDailyTracking';

interface DailyTrackingCardProps {
  cardClassName?: string;
  cardStyle?: React.CSSProperties;
}

// Dashboard summary of today's one-tap trackers, linking to the full /today page.
const DailyTrackingCard: React.FC<DailyTrackingCardProps> = ({ cardClassName, cardStyle }) => {
  const { eventTypes, totals } = useDailyTracking();

  const values = eventTypes.slice(0, 4).map((et) => {
    const total = totals[et.key] ?? 0;
    const unit = et.unit ? ` ${et.unit}` : '';
    return {
      label: et.label,
      value: et.dailyTarget != null ? `${total} / ${et.dailyTarget}${unit}` : `${total}${unit}`,
    };
  });

  if (values.length === 0) {
    values.push({ label: 'Trackers', value: 'None yet' });
  }

  return (
    <MultiValueCard
      title="Daily Tracking"
      values={values}
      icon={ListChecks}
      color="#0ea5e9"
      className={cardClassName}
      style={cardStyle}
      footer={
        <div className="mt-4 flex justify-center">
          <Link to="/today" className="text-sm font-medium text-primary hover:underline">
            Open Today →
          </Link>
        </div>
      }
    />
  );
};

export default DailyTrackingCard;
