
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle } from "lucide-react";
import { useAuth } from '@/lib/AuthContext';
import Layout from '@/components/Layout';
import WeightChart from '@/components/charts/WeightChart';
import WeightEntryModal from '@/components/weight/WeightEntryModal';
import { useWeightData } from '@/hooks/useWeightData';
import { usePeriodsData } from '@/hooks/usePeriodsData';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from 'react-router-dom';
import WeightPeriodStats from '@/components/weight/WeightPeriodStats';
import WeightChangeStats from '@/components/weight/WeightChangeStats';
import { useWeightCalculations } from '@/hooks/useWeightCalculations';

const Weight = () => {
  const { profile } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { weighIns, isLoading, addWeighIn } = useWeightData();
  const { getCurrentPeriod, isLoading: periodsLoading } = usePeriodsData();
  const navigate = useNavigate();

  // Get the unit based on user preference
  const isImperial = profile?.measurementUnit === 'imperial';
  const weightUnit = isImperial ? 'lbs' : 'kg';

  // Check if there's an active period
  const currentPeriod = getCurrentPeriod();

  const { convertWeight, getLatestWeight, calculateWeightChange } = useWeightCalculations(weighIns, isImperial);

  const latestWeight = getLatestWeight();
  
  // Calculate weights and changes
  const periodStartWeight = currentPeriod ? convertWeight(currentPeriod.startWeight) : 0;
  const currentWeight = latestWeight ? convertWeight(latestWeight.weight) : 0;
  
  const totalPeriodChange = currentWeight && periodStartWeight
    ? (currentWeight - periodStartWeight).toFixed(1)
    : "0.0";
  const isWeightLoss = Number(totalPeriodChange) < 0;

  // Calculate changes for different time periods
  const changes = {
    days7: calculateWeightChange(7),
    days30: calculateWeightChange(30),
    days90: calculateWeightChange(90),
    allTime: weighIns.length >= 2 ? {
      value: (convertWeight(weighIns[0].weight) - convertWeight(weighIns[weighIns.length - 1].weight)).toFixed(1)
    } : null
  };

  const onAddWeight = (weight: number, date: Date) => {
    const weightInKg = isImperial ? weight / 2.20462 : weight;
    addWeighIn({ weight: weightInKg, date });
    setIsModalOpen(false);
  };

  if (isLoading || periodsLoading) {
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
      <div className="container mx-auto px-4 py-12">
        {!currentPeriod && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No active period</AlertTitle>
            <AlertDescription className="flex justify-between items-center">
              <span>You need to create a period to track your weight progress effectively.</span>
              <Button size="sm" variant="outline" onClick={() => navigate('/periods')}>
                Create Period
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {weighIns.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No weight data recorded yet</p>
            <Button onClick={() => setIsModalOpen(true)} disabled={!currentPeriod}>
              <Plus className="mr-2" /> Add Your First Weight
            </Button>
          </div>
        ) : (
          <>
            <WeightPeriodStats
              periodStartWeight={periodStartWeight}
              currentWeight={currentWeight}
              totalPeriodChange={totalPeriodChange}
              isWeightLoss={isWeightLoss}
              weightUnit={weightUnit}
            />

            <WeightChangeStats
              changes={changes}
              weightUnit={weightUnit}
            />

            <Card className="mb-6">
              <CardContent className="pt-6">
                <WeightChart 
                  data={weighIns} 
                  isImperial={isImperial}
                />
              </CardContent>
            </Card>

            <Button 
              className="w-full py-6" 
              variant="default" 
              onClick={() => setIsModalOpen(true)}
              disabled={!currentPeriod}
            >
              <Plus className="mr-2" /> Add Weight
            </Button>
          </>
        )}
      </div>

      <WeightEntryModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onAddWeight}
        unit={weightUnit}
      />
    </Layout>
  );
};

export default Weight;
