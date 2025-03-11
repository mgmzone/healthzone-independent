
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from '@/lib/AuthContext';
import Layout from '@/components/Layout';
import { WeighIn } from '@/lib/types';
import { mockWeighIns } from '@/lib/types'; // Using mock data for now
import WeightChart from '@/components/charts/WeightChart';
import WeightEntryModal from '@/components/weight/WeightEntryModal';
import WeightStatsCard from '@/components/weight/WeightStatsCard';

const Weight = () => {
  const { profile, profileLoading, refreshProfile } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [weighIns, setWeighIns] = useState<WeighIn[]>([]);

  useEffect(() => {
    if (!profile && !profileLoading) {
      refreshProfile();
    }
    
    // Load mock data for now
    setWeighIns(mockWeighIns);
  }, [profile, profileLoading, refreshProfile]);

  // Get the unit based on user preference
  const isImperial = profile?.measurementUnit === 'imperial';
  const weightUnit = isImperial ? 'lbs' : 'kg';

  // Convert weight if needed based on measurement unit
  const convertWeight = (weight: number) => {
    if (!weight) return 0;
    return weight;
  };

  const getLatestWeight = () => {
    if (weighIns.length === 0) return null;
    return weighIns.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
  };

  const getLowestWeight = () => {
    if (weighIns.length === 0) return null;
    return weighIns.reduce((lowest, current) => 
      current.weight < lowest.weight ? current : lowest
    , weighIns[0]);
  };

  const calculateWeightChange = (days: number) => {
    if (weighIns.length < 2) return null;
    
    const sortedWeighIns = [...weighIns].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const latestWeight = sortedWeighIns[0];
    const latestDate = new Date(latestWeight.date);
    
    const targetDate = new Date(latestDate);
    targetDate.setDate(targetDate.getDate() - days);
    
    let closestPreviousWeighIn = null;
    
    for (let i = 1; i < sortedWeighIns.length; i++) {
      const weighInDate = new Date(sortedWeighIns[i].date);
      if (weighInDate <= targetDate || i === sortedWeighIns.length - 1) {
        closestPreviousWeighIn = sortedWeighIns[i];
        break;
      }
    }
    
    if (!closestPreviousWeighIn) return null;
    
    return {
      value: (latestWeight.weight - closestPreviousWeighIn.weight).toFixed(1),
      days: Math.round((latestDate.getTime() - new Date(closestPreviousWeighIn.date).getTime()) / (1000 * 60 * 60 * 24))
    };
  };

  const onAddWeight = (weight: number) => {
    // In a real app, this would save to the database
    const newWeighIn: WeighIn = {
      id: String(Date.now()),
      userId: '1',
      periodId: '1',
      date: new Date(),
      weight,
    };
    
    setWeighIns([newWeighIn, ...weighIns]);
    setIsModalOpen(false);
  };

  const latestWeight = getLatestWeight();
  const lowestWeight = getLowestWeight();
  const change7Days = calculateWeightChange(7);
  const change30Days = calculateWeightChange(30);
  const change90Days = calculateWeightChange(90);
  const changeAllTime = weighIns.length >= 2 ? {
    value: (latestWeight!.weight - weighIns[weighIns.length - 1].weight).toFixed(1)
  } : null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Top Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <WeightStatsCard 
            value={latestWeight ? convertWeight(latestWeight.weight) : 0}
            label="Current Weight"
            unit={weightUnit}
          />
          <WeightStatsCard 
            value={lowestWeight ? convertWeight(lowestWeight.weight) : 0}
            label="Lowest Entry"
            unit={weightUnit}
          />
        </div>

        {/* Middle Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <WeightStatsCard 
            value={change7Days ? Math.abs(Number(change7Days.value)) : 0}
            label={`Lost in 7 days`}
            isCompact
            isNegative={change7Days ? Number(change7Days.value) < 0 : false}
          />
          <WeightStatsCard 
            value={change30Days ? Math.abs(Number(change30Days.value)) : 0}
            label={`Lost in 30 days`}
            isCompact
            isNegative={change30Days ? Number(change30Days.value) < 0 : false}
          />
          <WeightStatsCard 
            value={change90Days ? Math.abs(Number(change90Days.value)) : 0}
            label={`Lost in 90 days`}
            isCompact
            isNegative={change90Days ? Number(change90Days.value) < 0 : false}
          />
          <WeightStatsCard 
            value={changeAllTime ? Math.abs(Number(changeAllTime.value)) : 0}
            label={`Lost all Time`}
            isCompact
            isNegative={changeAllTime ? Number(changeAllTime.value) < 0 : false}
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
        >
          <Plus className="mr-2" /> Add Weight
        </Button>
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
