import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { useExerciseGoals, ExerciseGoal } from '@/hooks/useExerciseGoals';
import { useExerciseData } from '@/hooks/useExerciseData';
import { processGoalsWithProgress } from './goals/goalUtils';
import NewGoalForm from './goals/NewGoalForm';
import EmptyGoalsState from './goals/EmptyGoalsState';
import GoalCard from './goals/GoalCard';

const ExerciseGoals = () => {
  const { goals, isLoading, addGoal, updateGoal, deleteGoal } = useExerciseGoals();
  const { exerciseLogs } = useExerciseData('period');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState<Partial<ExerciseGoal>>({ 
    name: '', 
    target: 0, 
    unit: '', 
    type: 'steps',
    period: 'weekly'
  });
  const [isAddingNew, setIsAddingNew] = useState(false);

  const goalsWithProgress = processGoalsWithProgress(goals, exerciseLogs);

  const handleEdit = (id: string) => {
    setEditingId(id);
  };

  const handleSave = (goal: ExerciseGoal) => {
    updateGoal.mutate({
      id: goal.id,
      name: goal.name,
      target: goal.target,
      unit: goal.unit,
      type: goal.type,
      period: goal.period
    });
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    deleteGoal.mutate(id);
  };

  const handleAddNew = () => {
    if (newGoal.name && newGoal.target && newGoal.target > 0 && newGoal.unit) {
      addGoal.mutate({
        name: newGoal.name,
        target: newGoal.target,
        unit: newGoal.unit,
        type: newGoal.type as 'steps' | 'distance' | 'minutes' | 'calories' | 'other',
        period: newGoal.period as 'daily' | 'weekly' | 'monthly',
        current: 0
      });
      setNewGoal({ name: '', target: 0, unit: '', type: 'steps', period: 'weekly' });
      setIsAddingNew(false);
    }
  };

  const handleCancelAdd = () => {
    setIsAddingNew(false);
    setNewGoal({ name: '', target: 0, unit: '', type: 'steps', period: 'weekly' });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Fitness Goals</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-60"></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Fitness Goals</h2>
        <Button 
          size="sm" 
          onClick={() => setIsAddingNew(!isAddingNew)}
          variant={isAddingNew ? "secondary" : "default"}
        >
          {isAddingNew ? "Cancel" : <>
            <Plus className="mr-2 h-4 w-4" /> Add Goal
          </>}
        </Button>
      </div>

      {isAddingNew && (
        <NewGoalForm
          newGoal={newGoal}
          setNewGoal={setNewGoal}
          handleAddNew={handleAddNew}
          handleCancelAdd={handleCancelAdd}
        />
      )}

      {goalsWithProgress.length === 0 && !isAddingNew ? (
        <EmptyGoalsState onAddGoal={() => setIsAddingNew(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goalsWithProgress.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              isEditing={editingId === goal.id}
              onEdit={handleEdit}
              onSave={handleSave}
              onCancelEdit={handleCancelEdit}
              onDelete={handleDelete}
              goalsWithProgress={goalsWithProgress}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExerciseGoals;
