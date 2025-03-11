
import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Layout from '@/components/Layout';
import { useFastingData } from '@/hooks/useFastingData';
import { usePeriodsData } from '@/hooks/usePeriodsData';
import FastingTimer from '@/components/fasting/FastingTimer';
import FastingStats from '@/components/fasting/FastingStats';
import FastingTable from '@/components/fasting/FastingTable';
import FastingPageHeader from '@/components/fasting/FastingPageHeader';
import FastingEntryModal from '@/components/fasting/FastingEntryModal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const Fasting = () => {
  const { profile } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { getCurrentPeriod } = usePeriodsData();
  const { 
    fastingLogs, 
    isLoading, 
    activeFast,
    startFast,
    endFast,
    addFast,
    updateFast,
    deleteFast
  } = useFastingData();
  
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'year'>('week');
  const currentPeriod = getCurrentPeriod();

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <div className="text-xl">Loading your fasting data...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <FastingPageHeader 
          onAddFast={() => setIsModalOpen(true)}
          activeFast={activeFast}
          onStartFast={startFast}
          onEndFast={endFast}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1 flex">
            <FastingTimer activeFast={activeFast} onEndFast={endFast} />
          </div>
          <div className="lg:col-span-2 flex">
            <Card className="p-6 w-full flex flex-col">
              <h2 className="text-xl font-semibold mb-4">Fasting Statistics</h2>
              <Tabs defaultValue="week" className="w-full flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="week" onClick={() => setTimeFilter('week')}>Week</TabsTrigger>
                  <TabsTrigger value="month" onClick={() => setTimeFilter('month')}>Month</TabsTrigger>
                  <TabsTrigger value="year" onClick={() => setTimeFilter('year')}>Year</TabsTrigger>
                </TabsList>
                <div className="flex-1 flex flex-col">
                  <TabsContent value="week" className="mt-0 flex-1">
                    <FastingStats fastingLogs={fastingLogs} timeFilter="week" />
                  </TabsContent>
                  <TabsContent value="month" className="mt-0 flex-1">
                    <FastingStats fastingLogs={fastingLogs} timeFilter="month" />
                  </TabsContent>
                  <TabsContent value="year" className="mt-0 flex-1">
                    <FastingStats fastingLogs={fastingLogs} timeFilter="year" />
                  </TabsContent>
                </div>
              </Tabs>
            </Card>
          </div>
        </div>

        <FastingTable 
          fastingLogs={fastingLogs}
          isLoading={isLoading}
          timeFilter={timeFilter}
          onUpdateFast={updateFast}
          onDeleteFast={deleteFast}
        />
      </div>

      <FastingEntryModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={addFast}
        defaultFastingSchedule={currentPeriod?.fastingSchedule}
      />
    </Layout>
  );
};

export default Fasting;
