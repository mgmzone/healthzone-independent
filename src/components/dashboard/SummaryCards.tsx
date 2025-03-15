
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Scale, Timer, Calendar } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { ExerciseLog, FastingLog, Period } from '@/lib/types';
import { isWithinInterval, startOfWeek, endOfWeek, format } from 'date-fns';

interface SummaryCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
}

interface SummaryCardsProps {
  latestWeight: number | null;
  weightUnit: string;
  currentPeriod: Period | undefined;
  exerciseLogs: ExerciseLog[];
  fastingLogs: FastingLog[];
  getDaysRemaining: (date: Date) => number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  latestWeight,
  weightUnit,
  currentPeriod,
  exerciseLogs,
  fastingLogs,
  getDaysRemaining
}) => {
  // Calculate current week's exercise minutes
  const calculateCurrentWeekExercise = () => {
    if (exerciseLogs.length === 0) return 0;
    
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    
    // Filter logs from the current week
    const currentWeekLogs = exerciseLogs.filter(log => {
      const logDate = new Date(log.date);
      return isWithinInterval(logDate, { start: weekStart, end: weekEnd });
    });
    
    // Calculate total minutes for the current week
    return currentWeekLogs.reduce((sum, log) => sum + log.minutes, 0);
  };

  // Get the most appropriate end date (projected or regular)
  const getEndDateForDisplay = (): Date | undefined => {
    if (!currentPeriod) return undefined;
    
    // If we have a projected end date and it's not too far in the future, use it
    if (currentPeriod.projectedEndDate) {
      const projectedDate = new Date(currentPeriod.projectedEndDate);
      const regularEndDate = currentPeriod.endDate ? new Date(currentPeriod.endDate) : undefined;
      
      // Only use projected date if it's within a reasonable timeframe (less than 30 weeks)
      const now = new Date();
      const weeksDiff = Math.round((projectedDate.getTime() - now.getTime()) / (7 * 24 * 60 * 60 * 1000));
      
      if (weeksDiff <= 30) {
        return projectedDate;
      }
    }
    
    // Fall back to regular end date
    return currentPeriod.endDate ? new Date(currentPeriod.endDate) : undefined;
  };
  
  // Get the remaining days for the active period
  const getRemainingDaysForDisplay = (): string => {
    if (!currentPeriod) return "No active period";
    
    const endDate = getEndDateForDisplay();
    if (!endDate) return "Ongoing";
    
    const days = getDaysRemaining(endDate);
    if (days > 365) return `${Math.round(days / 365)} years`;
    if (days > 90) return `${Math.round(days / 30)} months`;
    if (days <= 0) return "Completed";
    
    return `${days} days left`;
  };
  
  // Format the end date for display
  const getEndDateFormatted = (): string => {
    const endDate = getEndDateForDisplay();
    if (!endDate) return "";
    
    return ` (${format(endDate, 'MMM d, yyyy')})`;
  };

  const summaryCards: SummaryCardProps[] = [
    {
      title: "Current Weight",
      value: latestWeight ? `${latestWeight.toFixed(1)} ${weightUnit}` : "No data",
      icon: Scale,
      color: "#4287f5"
    },
    {
      title: "Active Period",
      value: currentPeriod 
        ? `${getRemainingDaysForDisplay()}${getEndDateFormatted()}`
        : "No active period",
      icon: Calendar,
      color: "#f5a742"
    },
    {
      title: "Current Week Exercise",
      value: `${calculateCurrentWeekExercise()} mins`,
      icon: Activity,
      color: "#42f5ad"
    },
    {
      title: "Fasting Streaks",
      value: `${fastingLogs.length} fasts`,
      icon: Timer,
      color: "#f542a7"
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, index) => (
          <Card key={index} className="border-t-4" style={{ borderTopColor: card.color }}>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full" style={{ backgroundColor: `${card.color}10` }}>
                  <card.icon className="h-5 w-5" style={{ color: card.color }} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{card.title}</h3>
                  <p className="text-sm text-muted-foreground">{card.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
