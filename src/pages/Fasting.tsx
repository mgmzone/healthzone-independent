
import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Layout from '@/components/Layout';
import { useFastingData } from '@/hooks/useFastingData';
import FastingTimer from '@/components/fasting/FastingTimer';
import FastingStats from '@/components/fasting/FastingStats';
import FastingTable from '@/components/fasting/FastingTable';
import FastingPageHeader from '@/components/fasting/FastingPageHeader';
import FastingEntryModal from '@/components/fasting/FastingEntryModal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

const Fasting = () => {
  const { profile } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  if (isLoading) {
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
      <div className="container mx-auto px-4 py-16">
        <FastingPageHeader 
          onAddFast={() => setIsModalOpen(true)}
          activeFast={activeFast}
          onStartFast={startFast}
          onEndFast={endFast}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <FastingTimer activeFast={activeFast} onEndFast={endFast} />
          </div>
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Fasting Statistics</h2>
              <Tabs defaultValue="week" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="week" onClick={() => setTimeFilter('week')}>Week</TabsTrigger>
                  <TabsTrigger value="month" onClick={() => setTimeFilter('month')}>Month</TabsTrigger>
                  <TabsTrigger value="year" onClick={() => setTimeFilter('year')}>Year</TabsTrigger>
                </TabsList>
                <TabsContent value="week" className="mt-0">
                  <FastingStats fastingLogs={fastingLogs} timeFilter="week" />
                </TabsContent>
                <TabsContent value="month" className="mt-0">
                  <FastingStats fastingLogs={fastingLogs} timeFilter="month" />
                </TabsContent>
                <TabsContent value="year" className="mt-0">
                  <FastingStats fastingLogs={fastingLogs} timeFilter="year" />
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>

        <FastingTable 
          fastingLogs={fastingLogs} 
          onUpdateFast={updateFast}
          onDeleteFast={deleteFast}
        />
      </div>

      <FastingEntryModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={addFast}
      />
    </Layout>
  );
};

export default Fasting;
