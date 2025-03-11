
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExerciseSummary from '@/components/exercise/ExerciseSummary';
import ExerciseTable from '@/components/exercise/ExerciseTable';
import ExerciseGoals from '@/components/exercise/ExerciseGoals';
import ExerciseEntryModal from '@/components/exercise/ExerciseEntryModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TimeFilter } from '@/lib/types';
import { useExerciseData } from '@/hooks/useExerciseData';
import ExercisePageHeader from '@/components/exercise/ExercisePageHeader';

const Exercise = () => {
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('week');
  const { 
    exerciseLogs, 
    isLoading, 
    addExerciseLog,
    updateExerciseLog,
    deleteExerciseLog
  } = useExerciseData(timeFilter);

  return (
    <Layout>
      <div className="container max-w-7xl py-6 space-y-6 mt-16">
        <ExercisePageHeader exerciseLogs={exerciseLogs} isLoading={isLoading} />
        
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Exercise Tracker</h1>
          <Button onClick={() => setIsEntryModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Activity
          </Button>
        </div>

        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
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
