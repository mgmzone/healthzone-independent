import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface WeightStatsCardProps {
  value: number;
  label: string;
  unit?: string;
  isCompact?: boolean;
  isNegative?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  subtitle?: string;
  trend?: { value: number; unit?: string; betterDirection?: 'up' | 'down' };
  accentClass?: string;
}

const WeightStatsCard: React.FC<WeightStatsCardProps> = ({
  value,
  label,
  unit = '',
  isCompact = false,
  isNegative = false,
  icon: Icon,
  iconColor = 'text-primary',
  subtitle,
  trend,
  accentClass,
}) => {
  const formattedValue = value.toFixed(1);

  const trendArrowUp = trend ? trend.value >= 0 : false;
  const trendIsGood = trend
    ? trend.betterDirection === 'down'
      ? trend.value < 0
      : trend.value > 0
    : false;
  const TrendIcon = trendArrowUp ? TrendingUp : TrendingDown;

  return (
    <Card
      className={cn(
        'overflow-hidden transition-shadow hover:shadow-md',
        isCompact && 'bg-gray-50 dark:bg-gray-900',
        accentClass
      )}
    >
      <CardContent className={cn('relative', isCompact ? 'p-3' : 'p-5')}>
        <div className="flex items-start justify-between">
          <div>
            <p className={cn('text-muted-foreground', isCompact ? 'text-xs' : 'text-sm')}>{label}</p>
            <div
              className={cn(
                'flex items-end mt-1 font-bold tracking-tight',
                isCompact ? 'text-2xl' : 'text-3xl'
              )}
            >
              <span className={isNegative ? 'text-destructive' : ''}>{formattedValue}</span>
              {unit && <span className="ml-1 text-sm text-muted-foreground font-normal">{unit}</span>}
            </div>
            {(subtitle || trend) && (
              <div className="flex items-center gap-1.5 mt-1.5 text-xs">
                {trend && (
                  <span
                    className={cn(
                      'flex items-center gap-0.5 font-medium',
                      trendIsGood ? 'text-emerald-600' : 'text-amber-600'
                    )}
                  >
                    <TrendIcon className="h-3 w-3" />
                    {Math.abs(trend.value).toFixed(1)}
                    {trend.unit || ''}
                  </span>
                )}
                {subtitle && <span className="text-muted-foreground">{subtitle}</span>}
              </div>
            )}
          </div>
          {Icon && (
            <div className={cn('rounded-full p-2 bg-primary/10', iconColor)}>
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeightStatsCard;
