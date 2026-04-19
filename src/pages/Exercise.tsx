
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExerciseSummary from '@/components/exercise/ExerciseSummary';
import ExerciseTable from '@/components/exercise/ExerciseTable';
import ExerciseGoals from '@/components/exercise/ExerciseGoals';
import ExerciseEntryModal from '@/components/exercise/ExerciseEntryModal';
import { Button } from '@/components/ui/button';
import { Plus, Activity, Loader2 } from 'lucide-react';
import { TimeFilter } from '@/lib/types';
import { useExerciseData } from '@/hooks/useExerciseData';
import ExercisePageHeader from '@/components/exercise/ExercisePageHeader';
import { usePeriodsData } from '@/hooks/usePeriodsData';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { syncStrava } from '@/lib/services/stravaService';
import { useToast } from '@/hooks/use-toast';

const Exercise = () => {
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const { getCurrentPeriod } = usePeriodsData();
  const currentPeriod = getCurrentPeriod();
  const navigate = useNavigate();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('week');
  const {
    exerciseLogs,
    isLoading,
    addExerciseLog,
    updateExerciseLog,
    deleteExerciseLog,
    refresh,
  } = useExerciseData(timeFilter);
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);

  const handleStravaSync = async () => {
    setSyncing(true);
    try {
      const res = await syncStrava('today');
      toast({
        title: 'Strava sync complete',
        description: `Imported ${res.inserted}, skipped ${res.skipped} already-synced of ${res.total} activities today.`,
      });
      refresh();
    } catch (err: any) {
      toast({
        title: 'Strava sync failed',
        description: err.message || 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-7xl py-6 space-y-6 mt-16">
        <ExercisePageHeader exerciseLogs={exerciseLogs} isLoading={isLoading} />
        
        {!currentPeriod && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No active period</AlertTitle>
            <AlertDescription className="flex justify-between items-center">
              <span>Create a period to log exercise activities.</span>
              <Button size="sm" variant="outline" onClick={() => navigate('/periods')}>
                Create Period
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Exercise Tracker</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleStravaSync} disabled={syncing || !currentPeriod}>
              {syncing
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Syncing...</>
                : <><Activity className="mr-2 h-4 w-4 text-orange-500" /> Sync Strava</>}
            </Button>
            <Button onClick={() => setIsEntryModalOpen(true)} disabled={!currentPeriod}>
              <Plus className="mr-2 h-4 w-4" /> Add Activity
            </Button>
          </div>
        </div>

        <Tabs defaultValue="summary" className="w-full">
          <TabsList variant="underline" className="w-full mb-6">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-6">
            <ExerciseSummary 
              exerciseLogs={exerciseLogs} 
              isLoading={isLoading}
              timeFilter={timeFilter}
              onTimeFilterChange={setTimeFilter}
            />
          </TabsContent>

          <TabsContent value="activities" className="space-y-6">
            <ExerciseTable 
              exerciseLogs={exerciseLogs} 
              isLoading={isLoading}
              onDelete={deleteExerciseLog}
              onUpdate={updateExerciseLog}
              timeFilter={timeFilter}
              onTimeFilterChange={setTimeFilter}
            />
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <ExerciseGoals />
          </TabsContent>
        </Tabs>

        <ExerciseEntryModal
          isOpen={isEntryModalOpen}
          onClose={() => setIsEntryModalOpen(false)}
          onSave={addExerciseLog}
        />
      </div>
    </Layout>
  );
};

export default Exercise;
