import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Scale, Timer, Calendar } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { ExerciseLog, FastingLog, Period } from '@/lib/types';
import { isWithinInterval, startOfWeek, endOfWeek, format, subWeeks } from 'date-fns';

interface SummaryCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
}

interface MultiValueCardProps {
  title: string;
  values: { label: string; value: string }[];
  icon: LucideIcon;
  color: string;
}

interface SummaryCardsProps {
  latestWeight: number | null;
  weightUnit: string;
  currentPeriod: Period | undefined;
  exerciseLogs: ExerciseLog[];
  fastingLogs: FastingLog[];
  getDaysRemaining: (date: Date, projectedEndDate?: Date | string | undefined) => number;
}

const MultiValueCard: React.FC<MultiValueCardProps> = ({ title, values, icon: Icon, color }) => {
  return (
    <Card className="border-t-4" style={{ borderTopColor: color }}>
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full" style={{ backgroundColor: `${color}10` }}>
              <Icon className="h-5 w-5" style={{ color: color }} />
            </div>
            <h3 className="font-semibold text-lg">{title}</h3>
          </div>
          <div className="grid grid-cols-1 gap-2 mt-2">
            {values.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{item.label}:</span>
                <span className="text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const StandardCard: React.FC<SummaryCardProps> = ({ title, value, icon: Icon, color }) => {
  return (
    <Card className="border-t-4" style={{ borderTopColor: color }}>
      <CardContent className="pt-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-full" style={{ backgroundColor: `${color}10` }}>
            <Icon className="h-5 w-5" style={{ color: color }} />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  latestWeight,
  weightUnit,
  currentPeriod,
  exerciseLogs,
  fastingLogs,
  getDaysRemaining
}) => {
  const calculateCurrentWeekExercise = () => {
    if (exerciseLogs.length === 0) return 0;
    
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    
    const currentWeekLogs = exerciseLogs.filter(log => {
      const logDate = new Date(log.date);
      return isWithinInterval(logDate, { start: weekStart, end: weekEnd });
    });
    
    return currentWeekLogs.reduce((sum, log) => sum + log.minutes, 0);
  };

  const calculatePreviousWeekExercise = () => {
    if (exerciseLogs.length === 0) return 0;
    
    const now = new Date();
    const previousWeekStart = startOfWeek(subWeeks(now, 1));
    const previousWeekEnd = endOfWeek(subWeeks(now, 1));
    
    const previousWeekLogs = exerciseLogs.filter(log => {
      const logDate = new Date(log.date);
      return isWithinInterval(logDate, { start: previousWeekStart, end: previousWeekEnd });
    });
    
    return previousWeekLogs.reduce((sum, log) => sum + log.minutes, 0);
  };

  const calculateAverageWeeklyExercise = () => {
    if (exerciseLogs.length === 0) return 0;
    
    const now = new Date();
    const fourWeeksAgo = subWeeks(now, 4);
    
    const recentLogs = exerciseLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= fourWeeksAgo;
    });
    
    if (recentLogs.length === 0) return 0;
    
    const totalMinutes = recentLogs.reduce((sum, log) => sum + log.minutes, 0);
    
    return Math.round(totalMinutes / 4);
  };

  const calculateExerciseGoalPercentage = () => {
    const weeklyGoal = 150;
    const currentWeekMinutes = calculateCurrentWeekExercise();
    const percentage = (currentWeekMinutes / weeklyGoal) * 100;
    return Math.min(Math.round(percentage), 100);
  };

  const getEndDateForDisplay = (): Date | undefined => {
    if (!currentPeriod) return undefined;
    
    if (currentPeriod.projectedEndDate) {
      return new Date(currentPeriod.projectedEndDate);
    }
    
    return currentPeriod.endDate ? new Date(currentPeriod.endDate) : undefined;
  };
  
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
  
  const getEndDateFormatted = (): string => {
    const endDate = getEndDateForDisplay();
    if (!endDate) return "";
    
    return format(endDate, 'MMM d, yyyy');
  };

  const getStartDateFormatted = (): string => {
    if (!currentPeriod || !currentPeriod.startDate) return "Not set";
    
    const startDate = new Date(currentPeriod.startDate);
    return format(startDate, 'MMM d, yyyy');
  };

  const formatWeight = (weight: number | undefined | null): string => {
    if (weight === undefined || weight === null) return "No data";
    return `${weight.toFixed(1)} ${weightUnit}`;
  };

  const getWeightValues = () => {
    const values = [];
    
    if (currentPeriod) {
      const startingWeight = currentPeriod.startWeight;
      values.push({ 
        label: "Starting", 
        value: formatWeight(startingWeight ? (weightUnit === 'lbs' ? startingWeight * 2.20462 : startingWeight) : null) 
      });
    }
    
    values.push({ 
      label: "Current", 
      value: formatWeight(latestWeight) 
    });
    
    if (currentPeriod) {
      const targetWeight = currentPeriod.targetWeight;
      values.push({ 
        label: "Target", 
        value: formatWeight(targetWeight ? (weightUnit === 'lbs' ? targetWeight * 2.20462 : targetWeight) : null) 
      });
    }
    
    return values;
  };

  const getPeriodValues = () => {
    const values = [];
    
    values.push({
      label: "Start Date",
      value: getStartDateFormatted()
    });
    
    if (currentPeriod && (currentPeriod.projectedEndDate || currentPeriod.endDate)) {
      values.push({
        label: "End Date",
        value: getEndDateFormatted()
      });
    }
    
    values.push({
      label: "Remaining",
      value: getRemainingDaysForDisplay()
    });
    
    return values;
  };

  const getExerciseValues = () => {
    const values = [];
    
    values.push({
      label: "This Week",
      value: `${calculateCurrentWeekExercise()} mins`
    });
    
    values.push({
      label: "Previous Week",
      value: `${calculatePreviousWeekExercise()} mins`
    });
    
    return values;
  };

  const standardCards = [
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
        <MultiValueCard
          title="Weight"
          values={getWeightValues()}
          icon={Scale}
          color="#4287f5"
        />
        
        <MultiValueCard
          title="Active Period"
          values={getPeriodValues()}
          icon={Calendar}
          color="#f5a742"
        />
        
        <MultiValueCard
          title="Exercise"
          values={getExerciseValues()}
          icon={Activity}
          color="#42f5ad"
        />
        
        {standardCards.map((card, index) => (
          <StandardCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
          />
        ))}
      </div>
    </div>
  );
};
