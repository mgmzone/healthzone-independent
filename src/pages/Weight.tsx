
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle } from "lucide-react";
import { useAuth } from '@/lib/AuthContext';
import Layout from '@/components/Layout';
import WeightChart from '@/components/charts/WeightChart';
import WeightEntryModal from '@/components/weight/WeightEntryModal';
import WeightStatsCard from '@/components/weight/WeightStatsCard';
import { useWeightData } from '@/hooks/useWeightData';
import { usePeriodsData } from '@/hooks/usePeriodsData';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from 'react-router-dom';

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

  // Convert weight if needed based on measurement unit
  const convertWeight = (weight: number) => {
    if (!weight) return 0;
    return isImperial ? weight * 2.20462 : weight;
  };

  const getLatestWeight = () => {
    if (weighIns.length === 0) return null;
    return weighIns[0];
  };

  const getLowestWeight = () => {
    if (weighIns.length === 0) return null;
    return weighIns.reduce((lowest, current) => 
      current.weight < lowest.weight ? current : lowest
    , weighIns[0]);
  };

  const calculateWeightChange = (days: number) => {
    if (weighIns.length < 2) return null;
    
    const latestWeight = weighIns[0];
    const latestDate = new Date(latestWeight.date);
    
    const targetDate = new Date(latestDate);
    targetDate.setDate(targetDate.getDate() - days);
    
    let closestPreviousWeighIn = null;
    
    for (let i = 1; i < weighIns.length; i++) {
      const weighInDate = new Date(weighIns[i].date);
      if (weighInDate <= targetDate || i === weighIns.length - 1) {
        closestPreviousWeighIn = weighIns[i];
        break;
      }
    }
    
    if (!closestPreviousWeighIn) return null;
    
    return {
      value: (convertWeight(latestWeight.weight) - convertWeight(closestPreviousWeighIn.weight)).toFixed(1),
      days: Math.round((latestDate.getTime() - new Date(closestPreviousWeighIn.date).getTime()) / (1000 * 60 * 60 * 24))
    };
  };

  const onAddWeight = (weight: number, date: Date) => {
    // Convert from lbs to kg if using imperial
    const weightInKg = isImperial ? weight / 2.20462 : weight;
    addWeighIn({ weight: weightInKg, date });
    setIsModalOpen(false);
  };

  const latestWeight = getLatestWeight();
  const lowestWeight = getLowestWeight();
  
  // Get starting weight from current period
  const periodStartWeight = currentPeriod ? convertWeight(currentPeriod.startWeight) : 0;
  const currentWeight = latestWeight ? convertWeight(latestWeight.weight) : 0;
  
  // Calculate total change since period start
  const totalPeriodChange = currentWeight && periodStartWeight
    ? (currentWeight - periodStartWeight).toFixed(1)
    : "0.0";
  const isWeightLoss = Number(totalPeriodChange) < 0;
  
  // Previous change calculations
  const change7Days = calculateWeightChange(7);
  const change30Days = calculateWeightChange(30);
  const change90Days = calculateWeightChange(90);
  const changeAllTime = weighIns.length >= 2 ? {
    value: (convertWeight(weighIns[0].weight) - convertWeight(weighIns[weighIns.length - 1].weight)).toFixed(1)
  } : null;

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
            {/* Top Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <WeightStatsCard 
                value={periodStartWeight}
                label="Starting Weight"
                unit={weightUnit}
              />
              <WeightStatsCard 
                value={currentWeight}
                label="Current Weight"
                unit={weightUnit}
              />
              <WeightStatsCard 
                value={Math.abs(Number(totalPeriodChange))}
                label={`${isWeightLoss ? 'Lost' : 'Gained'} This Period`}
                unit={weightUnit}
                isNegative={!isWeightLoss}
              />
            </div>

            {/* Middle Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <WeightStatsCard 
                value={change7Days ? Math.abs(Number(change7Days.value)) : 0}
                label={`${Number(change7Days?.value || 0) < 0 ? 'Lost' : 'Gained'} in 7 days`}
                isCompact
                isNegative={change7Days ? Number(change7Days.value) >= 0 : false}
                unit={weightUnit}
              />
              <WeightStatsCard 
                value={change30Days ? Math.abs(Number(change30Days.value)) : 0}
                label={`${Number(change30Days?.value || 0) < 0 ? 'Lost' : 'Gained'} in 30 days`}
                isCompact
                isNegative={change30Days ? Number(change30Days.value) >= 0 : false}
                unit={weightUnit}
              />
              <WeightStatsCard 
                value={change90Days ? Math.abs(Number(change90Days.value)) : 0}
                label={`${Number(change90Days?.value || 0) < 0 ? 'Lost' : 'Gained'} in 90 days`}
                isCompact
                isNegative={change90Days ? Number(change90Days.value) >= 0 : false}
                unit={weightUnit}
              />
              <WeightStatsCard 
                value={changeAllTime ? Math.abs(Number(changeAllTime.value)) : 0}
                label={`${Number(changeAllTime?.value || 0) < 0 ? 'Lost' : 'Gained'} all time`}
                isCompact
                isNegative={changeAllTime ? Number(changeAllTime.value) >= 0 : false}
                unit={weightUnit}
              />
            </div>

            {/* Weight Chart */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <WeightChart 
                  data={weighIns} 
                  isImperial={isImperial}
                />
              </CardContent>
            </Card>

            {/* Add Weight Button */}
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

      {/* Weight Entry Modal */}
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
