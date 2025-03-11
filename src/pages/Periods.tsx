
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle } from "lucide-react";
import { useAuth } from '@/lib/AuthContext';
import { usePeriodsData } from '@/hooks/usePeriodsData';
import { useWeightData } from '@/hooks/useWeightData';
import PeriodEntryModal from '@/components/periods/PeriodEntryModal';
import PeriodCard from '@/components/periods/PeriodCard';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from 'react-router-dom';

const Periods = () => {
  const { profile } = useAuth();
  const { periods, isLoading: periodsLoading, addPeriod, getCurrentPeriod } = usePeriodsData();
  const { weighIns, isLoading: weighInsLoading } = useWeightData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [needsFirstPeriod, setNeedsFirstPeriod] = useState(false);
  const navigate = useNavigate();

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {periods.map(period => (
                <PeriodCard
                  key={period.id}
                  period={period}
                  isActive={currentPeriod?.id === period.id}
                  weightUnit={weightUnit}
                  latestWeight={latestWeight || undefined}
                />
              ))}
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
