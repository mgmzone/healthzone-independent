import React from 'react';
import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendArrowProps {
  current: number;
  previous: number;
  unit?: string;
  // By default up is "good" (green). For metrics like weight where down is good, pass "lower".
  betterDirection?: 'higher' | 'lower';
  // Optional threshold (percent) under which the trend is considered flat.
  flatThresholdPct?: number;
  className?: string;
}

const TrendArrow: React.FC<TrendArrowProps> = ({
  current,
  previous,
  unit = '',
  betterDirection = 'higher',
  flatThresholdPct = 2,
  className,
}) => {
  if (!isFinite(current) || !isFinite(previous) || previous === 0) {
    return null;
  }

  const delta = current - previous;
  const pct = (delta / Math.abs(previous)) * 100;
  const isFlat = Math.abs(pct) < flatThresholdPct;

  let Icon = ArrowRight;
  let colorClass = 'text-muted-foreground';

  if (!isFlat) {
    const isUp = delta > 0;
    Icon = isUp ? ArrowUp : ArrowDown;
    const isBetter = betterDirection === 'higher' ? isUp : !isUp;
    colorClass = isBetter ? 'text-green-600' : 'text-red-600';
  }

  const sign = delta > 0 ? '+' : '';
  const display = Math.abs(delta) >= 10
    ? `${sign}${Math.round(delta)}${unit}`
    : `${sign}${delta.toFixed(1)}${unit}`;

  return (
    <span
      className={cn('inline-flex items-center gap-0.5 text-xs', colorClass, className)}
      title="vs. previous 7 days"
    >
      <Icon className="h-3 w-3" />
      {display}
    </span>
  );
};

export default TrendArrow;
