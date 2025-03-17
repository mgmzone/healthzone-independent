
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
    
    // Always use projected end date if available
    if (currentPeriod.projectedEndDate) {
      return new Date(currentPeriod.projectedEndDate);
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
    
    return format(endDate, 'MMM d, yyyy');
  };

  // Format the start date for display
  const getStartDateFormatted = (): string => {
    if (!currentPeriod || !currentPeriod.startDate) return "Not set";
    
    const startDate = new Date(currentPeriod.startDate);
    return format(startDate, 'MMM d, yyyy');
  };

  // Format a weight value with the appropriate unit
  const formatWeight = (weight: number | undefined | null): string => {
    if (weight === undefined || weight === null) return "No data";
    return `${weight.toFixed(1)} ${weightUnit}`;
  };

  // Create weight values array for the multi-value card
  const getWeightValues = () => {
    const values = [];
    
    // Add starting weight if available
    if (currentPeriod) {
      const startingWeight = currentPeriod.startWeight;
      values.push({ 
        label: "Starting", 
        value: formatWeight(startingWeight ? (weightUnit === 'lbs' ? startingWeight * 2.20462 : startingWeight) : null) 
      });
    }
    
    // Add current weight
    values.push({ 
      label: "Current", 
      value: formatWeight(latestWeight) 
    });
    
    // Add target weight if available
    if (currentPeriod) {
      const targetWeight = currentPeriod.targetWeight;
      values.push({ 
        label: "Target", 
        value: formatWeight(targetWeight ? (weightUnit === 'lbs' ? targetWeight * 2.20462 : targetWeight) : null) 
      });
    }
    
    return values;
  };

  // Create period values array for the multi-value card
  const getPeriodValues = () => {
    const values = [];
    
    // Add start date
    values.push({
      label: "Start Date",
      value: getStartDateFormatted()
    });
    
    // Add end date if available
    if (currentPeriod && (currentPeriod.projectedEndDate || currentPeriod.endDate)) {
      values.push({
        label: "End Date",
        value: getEndDateFormatted()
      });
    }
    
    // Add remaining days
    values.push({
      label: "Remaining",
      value: getRemainingDaysForDisplay()
    });
    
    return values;
  };

  // Update to use MultiValueCard for Period
  const standardCards = [
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
        {/* Weight multi-value card */}
        <MultiValueCard
          title="Weight"
          values={getWeightValues()}
          icon={Scale}
          color="#4287f5"
        />
        
        {/* Period multi-value card */}
        <MultiValueCard
          title="Active Period"
          values={getPeriodValues()}
          icon={Calendar}
          color="#f5a742"
        />
        
        {/* Other standard cards */}
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
