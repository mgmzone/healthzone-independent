
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, CheckCircle2, TrendingDown } from "lucide-react";
import { differenceInCalendarDays, format } from 'date-fns';
import WeightForecastChartWrapper from '@/components/charts/WeightForecastChart';
import { Period, WeighIn } from '@/lib/types';
import { generateForecastPoints } from '@/components/charts/weight-forecast/utils/forecast/forecastGenerator';

interface WeightForecastSectionProps {
  weighIns: WeighIn[];
  currentPeriod: Period;
  isImperial: boolean;
}

const WeightForecastSection: React.FC<WeightForecastSectionProps> = ({
  weighIns,
  currentPeriod,
  isImperial
}) => {
  const unit = isImperial ? 'lbs' : 'kg';

  // Run the same forecast math the chart uses so the header text and the
  // chart's projected-completion line agree on the date.
  const summary = useMemo(() => {
    const displayTarget = currentPeriod.targetWeight
      ? (isImperial ? currentPeriod.targetWeight * 2.20462 : currentPeriod.targetWeight)
      : undefined;

    const history = [...weighIns]
      .map((w) => ({
        date: new Date(w.date),
        weight: isImperial ? w.weight * 2.20462 : w.weight,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    const result = generateForecastPoints(
      history,
      displayTarget,
      currentPeriod.weightLossPerWeek
    );

    const anchorWeight = history.length ? history[history.length - 1].weight : null;
    const remaining =
      anchorWeight != null && displayTarget != null
        ? Math.max(0, anchorWeight - displayTarget)
        : null;

    const daysToGo = result.projectedEndDate
      ? differenceInCalendarDays(result.projectedEndDate, new Date())
      : null;

    return {
      displayTarget,
      projectedEnd: result.projectedEndDate,
      targetReached: result.targetReached,
      remaining,
      daysToGo,
      haveEnoughData: history.length > 0,
    };
  }, [weighIns, currentPeriod.targetWeight, currentPeriod.weightLossPerWeek, isImperial]);

  return (
    <Card className="w-full mb-8">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle>Weight Forecast</CardTitle>
            {summary.targetReached ? (
              <div className="mt-2 flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="font-medium text-emerald-700 dark:text-emerald-400">
                  Target reached
                </span>
                {summary.displayTarget != null && (
                  <span className="text-muted-foreground">
                    · {summary.displayTarget.toFixed(1)} {unit}
                  </span>
                )}
              </div>
            ) : summary.projectedEnd && summary.displayTarget != null ? (
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                <CalendarCheck className="h-4 w-4 text-primary" />
                <span>
                  Projected to hit{' '}
                  <span className="font-medium text-foreground">
                    {summary.displayTarget.toFixed(1)} {unit}
                  </span>{' '}
                  on{' '}
                  <span className="font-medium text-foreground">
                    {format(summary.projectedEnd, 'MMM d, yyyy')}
                  </span>
                </span>
                {summary.daysToGo != null && summary.daysToGo >= 0 && (
                  <Badge variant="secondary" className="text-xs font-normal">
                    {summary.daysToGo === 0
                      ? 'today'
                      : summary.daysToGo === 1
                      ? '1 day to go'
                      : `${summary.daysToGo} days to go`}
                  </Badge>
                )}
                {summary.remaining != null && summary.remaining > 0 && (
                  <Badge variant="outline" className="text-xs font-normal">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    {summary.remaining.toFixed(1)} {unit} remaining
                  </Badge>
                )}
              </div>
            ) : summary.haveEnoughData ? (
              <div className="mt-2 text-sm text-muted-foreground">
                Not enough trend yet — log a few more weigh-ins to see a forecast.
              </div>
            ) : (
              <div className="mt-2 text-sm text-muted-foreground">
                Log a few weigh-ins and set a target to see a forecast.
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[400px]">
        <WeightForecastChartWrapper
          weighIns={weighIns}
          currentPeriod={currentPeriod}
          isImperial={isImperial}
        />
      </CardContent>
    </Card>
  );
};

export default WeightForecastSection;
