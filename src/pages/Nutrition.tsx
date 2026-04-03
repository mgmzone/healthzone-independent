import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { usePeriodsData } from '@/hooks/usePeriodsData';
import { useMealData } from '@/hooks/useMealData';
import { useDailyGoalsData } from '@/hooks/useDailyGoalsData';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { MealLog } from '@/lib/types';
import DailyGoalsChecklist from '@/components/nutrition/DailyGoalsChecklist';
import ProteinSummary from '@/components/nutrition/ProteinSummary';
import MealLogForm from '@/components/nutrition/MealLogForm';
import MealTable from '@/components/nutrition/MealTable';
import GoalManager from '@/components/nutrition/GoalManager';
import ProteinSourceManager from '@/components/nutrition/ProteinSourceManager';

const Nutrition = () => {
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<MealLog | undefined>(undefined);
  const { getCurrentPeriod } = usePeriodsData();
  const currentPeriod = getCurrentPeriod();
  const navigate = useNavigate();

  const {
    mealLogs,
    proteinSources,
    isLoading: mealsLoading,
    addMealLog,
    updateMealLog,
    deleteMealLog,
    addProteinSource,
    updateProteinSource,
    deleteProteinSource,
  } = useMealData();

  const {
    activeGoals,
    goals,
    entries,
    isLoading: goalsLoading,
    addGoal,
    updateGoal,
    deleteGoal,
    toggleEntry,
    getEntriesForDate,
    getGoalStreak,
    getPerfectDayStreak,
    getTodayCompliance,
  } = useDailyGoalsData();

  const handleSaveMeal = async (data: Partial<MealLog>) => {
    if (editingMeal) {
      await updateMealLog(editingMeal.id, data);
    } else {
      await addMealLog(data);
    }
    setEditingMeal(undefined);
  };

  const handleEditMeal = (meal: MealLog) => {
    setEditingMeal(meal);
    setIsEntryModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEntryModalOpen(false);
    setEditingMeal(undefined);
  };

  return (
    <Layout>
      <div className="container max-w-7xl py-6 space-y-6 mt-16">
        {!currentPeriod && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No active period</AlertTitle>
            <AlertDescription className="flex justify-between items-center">
              <span>Create a period to start tracking nutrition.</span>
              <Button size="sm" variant="outline" onClick={() => navigate('/periods')}>
                Create Period
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Nutrition</h1>
          <Button onClick={() => setIsEntryModalOpen(true)} disabled={!currentPeriod}>
            <Plus className="mr-2 h-4 w-4" /> Log Meal
          </Button>
        </div>

        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full max-w-lg grid-cols-4">
            <TabsTrigger value="daily">Daily Check-in</TabsTrigger>
            <TabsTrigger value="meals">Meals</TabsTrigger>
            <TabsTrigger value="goals">Manage Goals</TabsTrigger>
            <TabsTrigger value="foods">My Foods</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DailyGoalsChecklist
                goals={activeGoals}
                entries={entries}
                onToggle={toggleEntry}
                getEntriesForDate={getEntriesForDate}
                getGoalStreak={getGoalStreak}
                getPerfectDayStreak={getPerfectDayStreak}
              />
              <ProteinSummary mealLogs={mealLogs} />
            </div>
          </TabsContent>

          <TabsContent value="meals" className="space-y-6">
            <MealTable
              mealLogs={mealLogs}
              isLoading={mealsLoading}
              onDelete={deleteMealLog}
              onEdit={handleEditMeal}
            />
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <GoalManager
              goals={goals}
              onAdd={addGoal}
              onUpdate={updateGoal}
              onDelete={deleteGoal}
            />
          </TabsContent>

          <TabsContent value="foods" className="space-y-6">
            <ProteinSourceManager
              sources={proteinSources}
              onAdd={addProteinSource}
              onUpdate={updateProteinSource}
              onDelete={deleteProteinSource}
            />
          </TabsContent>
        </Tabs>

        <MealLogForm
          isOpen={isEntryModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveMeal}
          proteinSources={proteinSources}
          initialData={editingMeal}
        />
      </div>
    </Layout>
  );
};

export default Nutrition;
