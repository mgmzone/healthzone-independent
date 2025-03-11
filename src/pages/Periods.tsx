
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle } from "lucide-react";
import { useAuth } from '@/lib/AuthContext';
import { usePeriodsData } from '@/hooks/usePeriodsData';
import { useWeightData } from '@/hooks/useWeightData';
import PeriodEntryModal from '@/components/periods/PeriodEntryModal';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import ProgressCircle from '@/components/ProgressCircle';
import WeightStatsCard from '@/components/weight/WeightStatsCard';
import { getProgressPercentage } from '@/lib/types';
import { 
  getWeeksInPeriod, 
  getMonthsInPeriod, 
  getTimeProgressPercentage,
  getRemainingTimePercentage,
  getDaysRemaining 
} from '@/lib/utils/dateUtils';

const Periods = () => {
  const { profile } = useAuth();
  const { periods, isLoading: periodsLoading, addPeriod, getCurrentPeriod } = usePeriodsData();
  const { weighIns, isLoading: weighInsLoading } = useWeightData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [needsFirstPeriod, setNeedsFirstPeriod] = useState(false);

  const isImperial = profile?.measurementUnit === 'imperial';
  const weightUnit = isImperial ? 'lbs' : 'kg';

  // Convert weight if needed based on measurement unit
  const convertWeight = (weight: number) => {
    if (!weight) return 0;
    return isImperial ? weight * 2.20462 : weight;
  };

  // Get the latest weight
  const getLatestWeight = () => {
    if (weighIns.length === 0) return null;
    return convertWeight(weighIns[0].weight);
  };

  const latestWeight = getLatestWeight();
  const currentPeriod = getCurrentPeriod();

  // Check if the user needs to create their first period
  useEffect(() => {
    if (!periodsLoading && periods.length === 0) {
      setNeedsFirstPeriod(true);
    }
  }, [periodsLoading, periods]);

  // Handler for saving a new period
  const handleSavePeriod = (periodData: {
    startWeight: number,
    targetWeight: number,
    type: 'weightLoss' | 'maintenance',
    startDate: Date,
    endDate?: Date,
    fastingSchedule: string
  }) => {
    // Convert from imperial to metric if necessary
    const startWeight = isImperial ? periodData.startWeight / 2.20462 : periodData.startWeight;
    const targetWeight = isImperial ? periodData.targetWeight / 2.20462 : periodData.targetWeight;
    
    addPeriod({
      ...periodData,
      startWeight,
      targetWeight
    });
    
    setIsModalOpen(false);
    setNeedsFirstPeriod(false);
  };

  // Format weight with 1 decimal place
  const formatWeight = (weight: number): string => {
    return weight.toFixed(1);
  };

  // Show loading state
  if (periodsLoading || weighInsLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">Loading...</div>
        </div>
      </Layout>
    );
  }

  // Calculate metrics for current period (if exists)
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
      ? 'lost' 
      : 'gained'
  } : null;

  return (
    <Layout>
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Periods</h1>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2" /> Add Period
          </Button>
        </div>

        {needsFirstPeriod ? (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Create Your First Period</h2>
                <p className="text-muted-foreground mb-6">
                  To start tracking your progress, you need to create your first period.
                  A period represents a phase in your health journey, like weight loss or maintenance.
                </p>
                <Button size="lg" onClick={() => setIsModalOpen(true)}>
                  <Plus className="mr-2" /> Create First Period
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {!currentPeriod && (
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No active period</AlertTitle>
                <AlertDescription>
                  You don't have an active period. Create a new one to continue tracking your progress.
                </AlertDescription>
              </Alert>
            )}

            {/* Current Period Metrics Cards */}
            {currentPeriod && currentMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Weight Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center pt-0">
                    <ProgressCircle 
                      value={currentMetrics.weightProgress}
                      size={120}
                      strokeWidth={10}
                      showPercentage={true}
                      valueLabel={currentMetrics.weightProgress >= 100 ? "Goal Reached!" : "of target"}
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Time Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center pt-0">
                    <ProgressCircle 
                      value={currentMetrics.timeProgress}
                      size={120}
                      strokeWidth={10}
                      showPercentage={true}
                      valueLabel={`${currentMetrics.daysRemaining} days left`}
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Period Duration</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-2">
                      <WeightStatsCard 
                        value={currentMetrics.totalWeeks} 
                        label="Weeks" 
                        isCompact={true} 
                      />
                      <WeightStatsCard 
                        value={currentMetrics.totalMonths} 
                        label="Months" 
                        isCompact={true} 
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Weight Change</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="text-3xl font-bold">{formatWeight(currentMetrics.weightChange)}</div>
                      <div className="text-sm text-muted-foreground">{weightUnit} {currentMetrics.weightDirection}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-3 text-left">Period</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-center">Start Weight</th>
                    <th className="px-4 py-3 text-center">Target Weight</th>
                    <th className="px-4 py-3 text-center">Current Weight</th>
                    <th className="px-4 py-3 text-center">Fasting</th>
                    <th className="px-4 py-3 text-center">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {periods.map(period => {
                    const formattedStartDate = format(new Date(period.startDate), "MMM d, yyyy");
                    const formattedEndDate = period.endDate 
                      ? format(new Date(period.endDate), "MMM d, yyyy")
                      : "Present";
                    
                    const weeks = getWeeksInPeriod(period.startDate, period.endDate);
                    const months = getMonthsInPeriod(period.startDate, period.endDate);
                    
                    const weightChange = latestWeight 
                      ? Math.abs(convertWeight(period.startWeight) - latestWeight)
                      : 0;
                    const weightDirection = latestWeight && latestWeight < convertWeight(period.startWeight) 
                      ? 'lost' 
                      : 'gained';
                      
                    return (
                      <tr 
                        key={period.id} 
                        className={`border-b ${currentPeriod?.id === period.id ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                      >
                        <td className="px-4 py-4">
                          <div className="font-medium">{formattedStartDate} - {formattedEndDate}</div>
                          {currentPeriod?.id === period.id && (
                            <span className="inline-block px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full mt-1">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant={period.type === 'weightLoss' ? 'default' : 'secondary'}>
                            {period.type === 'weightLoss' ? 'Weight Loss' : 'Maintenance'}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-center">{formatWeight(convertWeight(period.startWeight))} {weightUnit}</td>
                        <td className="px-4 py-4 text-center">{formatWeight(convertWeight(period.targetWeight))} {weightUnit}</td>
                        <td className="px-4 py-4">
                          {latestWeight ? (
                            <div className="flex flex-col items-center">
                              <div className="font-medium">{formatWeight(latestWeight)} {weightUnit}</div>
                              <div className="text-xs text-muted-foreground">
                                {formatWeight(weightChange)} {weightUnit} {weightDirection}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center">-</div>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">{period.fastingSchedule}</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col items-center">
                            <div className="text-sm">{weeks} weeks</div>
                            <div className="text-xs text-muted-foreground">{months} months</div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <PeriodEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePeriod}
        defaultValues={{
          startWeight: latestWeight || undefined,
          targetWeight: profile?.targetWeight ? convertWeight(profile.targetWeight) : undefined
        }}
        weightUnit={weightUnit}
      />
    </Layout>
  );
};

export default Periods;
