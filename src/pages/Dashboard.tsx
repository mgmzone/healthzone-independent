
import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import Layout from '@/components/Layout';
import { usePeriodsData } from '@/hooks/usePeriodsData';
import { useWeightData } from '@/hooks/useWeightData';
import { useExerciseData } from '@/hooks/useExerciseData';
import { useFastingData } from '@/hooks/useFastingData';
import PeriodMetricsCards from '@/components/periods/PeriodMetricsCards';
import NoPeriodAlert from '@/components/periods/NoPeriodAlert';
import NoActivePeriodAlert from '@/components/periods/NoActivePeriodAlert';
import { Card, CardContent } from "@/components/ui/card";
import FastingStats from '@/components/fasting/FastingStats';
import ExerciseSummary from '@/components/exercise/ExerciseSummary';
import { Activity, Scale, Timer, Calendar } from 'lucide-react';
import { 
  getTimeProgressPercentage,
  getRemainingTimePercentage,
  getDaysRemaining,
  getWeeksInPeriod,
  getMonthsInPeriod
} from '@/lib/utils/dateUtils';
import { getProgressPercentage } from '@/lib/types';

const Dashboard = () => {
  const { profile } = useAuth();
  const { periods, isLoading: periodsLoading, getCurrentPeriod } = usePeriodsData();
  const { weighIns, isLoading: weighInsLoading } = useWeightData();
  const { exerciseLogs } = useExerciseData('week');
  const { fastingLogs } = useFastingData();
  
  const isImperial = profile?.measurementUnit === 'imperial';
  const weightUnit = isImperial ? 'lbs' : 'kg';

  const convertWeight = (weight: number) => {
    if (!weight) return 0;
    return isImperial ? weight * 2.20462 : weight;
  };

  const getLatestWeight = () => {
    if (weighIns.length === 0) return null;
    return convertWeight(weighIns[0].weight);
  };

  const latestWeight = getLatestWeight();
  const currentPeriod = getCurrentPeriod();

  const currentMetrics = currentPeriod ? {
    weightProgress: latestWeight
      ? getProgressPercentage(latestWeight, convertWeight(currentPeriod.startWeight), convertWeight(currentPeriod.targetWeight))
      : 0,
    timeProgress: getTimeProgressPercentage(currentPeriod.startDate, currentPeriod.endDate),
    timeRemaining: getRemainingTimePercentage(currentPeriod.startDate, currentPeriod.endDate),
    daysRemaining: getDaysRemaining(currentPeriod.endDate),
    totalWeeks: getWeeksInPeriod(currentPeriod.startDate, currentPeriod.endDate),
    totalMonths: getMonthsInPeriod(currentPeriod.startDate, currentPeriod.endDate),
    weightChange: latestWeight 
      ? Math.abs(convertWeight(currentPeriod.startWeight) - latestWeight)
      : 0,
    weightDirection: latestWeight && latestWeight < convertWeight(currentPeriod.startWeight) 
      ? 'lost' as const
      : 'gained' as const
  } : null;

  if (periodsLoading || weighInsLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">Loading...</div>
        </div>
      </Layout>
    );
  }

  const summaryCards = [
    {
      title: "Weight Progress",
      value: latestWeight ? `${latestWeight.toFixed(1)} ${weightUnit}` : "No data",
      icon: Scale,
      color: "#4287f5"
    },
    {
      title: "Active Period",
      value: currentPeriod ? `${getDaysRemaining(currentPeriod.endDate)} days left` : "No active period",
      icon: Calendar,
      color: "#f5a742"
    },
    {
      title: "Exercise Minutes",
      value: `${exerciseLogs.reduce((sum, log) => sum + log.minutes, 0)} mins`,
      icon: Activity,
      color: "#42f5ad"
    },
    {
      title: "Fasting Streaks",
      value: `${fastingLogs.filter(log => log.endTime).length} fasts`,
      icon: Timer,
      color: "#f542a7"
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto p-6 mt-16">
        <div className="w-full max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

          {periods.length === 0 ? (
            <NoPeriodAlert onCreatePeriod={() => {}} />
          ) : (
            <>
              {!currentPeriod && <NoActivePeriodAlert />}
              {currentPeriod && currentMetrics && (
                <PeriodMetricsCards
                  weightProgress={currentMetrics.weightProgress}
                  timeProgress={currentMetrics.timeProgress}
                  timeRemaining={currentMetrics.timeRemaining}
                  daysRemaining={currentMetrics.daysRemaining}
                  totalWeeks={currentMetrics.totalWeeks}
                  totalMonths={currentMetrics.totalMonths}
                  weightChange={currentMetrics.weightChange}
                  weightDirection={currentMetrics.weightDirection}
                  weightUnit={weightUnit}
                />
              )}
            </>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Activity Minutes</h2>
              <ExerciseSummary 
                exerciseLogs={exerciseLogs}
                isLoading={false}
                timeFilter="week"
                onTimeFilterChange={() => {}}
              />
            </Card>
            
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Fasting Progress</h2>
              <FastingStats 
                fastingLogs={fastingLogs}
                timeFilter="week"
              />
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

