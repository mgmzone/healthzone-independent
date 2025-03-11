
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit2, Plus, Save, Trash2, X } from 'lucide-react';
import ProgressCircle from '@/components/ProgressCircle';
import { useExerciseGoals, ExerciseGoal } from '@/hooks/useExerciseGoals';
import { useExerciseData } from '@/hooks/useExerciseData';
import { startOfDay, startOfWeek, startOfMonth, isWithinInterval, endOfDay, endOfWeek, endOfMonth } from 'date-fns';

const GOAL_TYPES = [
  { value: 'steps', label: 'Steps' },
  { value: 'distance', label: 'Distance' },
  { value: 'minutes', label: 'Minutes' },
  { value: 'calories', label: 'Calories' },
  { value: 'other', label: 'Other' }
];

const GOAL_PERIODS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }
];

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

  // Calculate current progress for each goal
  const goalsWithProgress = goals.map(goal => {
    let current = 0;
    const now = new Date();
    
    // Define the time period based on goal period
    let periodStart, periodEnd;
    
    switch(goal.period) {
      case 'daily':
        periodStart = startOfDay(now);
        periodEnd = endOfDay(now);
        break;
      case 'weekly':
        periodStart = startOfWeek(now);
        periodEnd = endOfWeek(now);
        break;
      case 'monthly':
        periodStart = startOfMonth(now);
        periodEnd = endOfMonth(now);
        break;
    }
    
    // Filter logs that are within the time period
    const logsInPeriod = exerciseLogs.filter(log => {
      const logDate = new Date(log.date);
      return isWithinInterval(logDate, { start: periodStart, end: periodEnd });
    });
    
    // Calculate sum based on goal type
    switch(goal.type) {
      case 'steps':
        current = logsInPeriod.reduce((sum, log) => sum + (log.steps || 0), 0);
        break;
      case 'distance':
        current = logsInPeriod.reduce((sum, log) => sum + (log.distance || 0), 0);
        break;
      case 'minutes':
        current = logsInPeriod.reduce((sum, log) => sum + log.minutes, 0);
        break;
      // For calories and other, we would need to add additional data to logs
      default:
        current = 0;
    }
    
    return { ...goal, current };
  });

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
        <Card>
          <CardHeader>
            <CardTitle>New Goal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="goalName">Goal Name</Label>
                <Input 
                  id="goalName" 
                  placeholder="e.g., Daily steps" 
                  value={newGoal.name}
                  onChange={e => setNewGoal({...newGoal, name: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="goalType">Type</Label>
                  <Select 
                    value={newGoal.type} 
                    onValueChange={value => setNewGoal({...newGoal, type: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {GOAL_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="goalPeriod">Period</Label>
                  <Select 
                    value={newGoal.period} 
                    onValueChange={value => setNewGoal({...newGoal, period: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      {GOAL_PERIODS.map(period => (
                        <SelectItem key={period.value} value={period.value}>
                          {period.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="goalTarget">Target</Label>
                  <Input 
                    id="goalTarget" 
                    type="number" 
                    placeholder="10000" 
                    value={newGoal.target || ''}
                    onChange={e => setNewGoal({...newGoal, target: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goalUnit">Unit</Label>
                  <Input 
                    id="goalUnit" 
                    placeholder="e.g., steps, km, minutes" 
                    value={newGoal.unit}
                    onChange={e => setNewGoal({...newGoal, unit: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-2">
                <Button variant="outline" onClick={handleCancelAdd}>
                  <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
                <Button onClick={handleAddNew}>
                  <Plus className="mr-2 h-4 w-4" /> Add Goal
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {goalsWithProgress.length === 0 && !isAddingNew ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="rounded-full bg-muted p-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No goals set</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Set fitness goals to track your progress. Goals can be based on steps, distance, active minutes, or other metrics.
            </p>
            <Button 
              size="sm" 
              onClick={() => setIsAddingNew(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Your First Goal
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goalsWithProgress.map(goal => {
            const progress = Math.min(Math.round((goal.current / goal.target) * 100), 100);
            const isEditing = editingId === goal.id;
            
            if (isEditing) {
              // Edit mode for the goal
              return (
                <Card key={goal.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Input 
                      value={goal.name}
                      onChange={e => {
                        const updatedGoal = { ...goal, name: e.target.value };
                        const index = goalsWithProgress.findIndex(g => g.id === goal.id);
                        goalsWithProgress[index] = updatedGoal;
                      }}
                      className="w-full mr-2"
                    />
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleSave(goal)}>
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={handleCancelEdit}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select 
                          value={goal.type} 
                          onValueChange={value => {
                            const updatedGoal = { ...goal, type: value as any };
                            const index = goalsWithProgress.findIndex(g => g.id === goal.id);
                            goalsWithProgress[index] = updatedGoal;
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {GOAL_TYPES.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Period</Label>
                        <Select 
                          value={goal.period} 
                          onValueChange={value => {
                            const updatedGoal = { ...goal, period: value as any };
                            const index = goalsWithProgress.findIndex(g => g.id === goal.id);
                            goalsWithProgress[index] = updatedGoal;
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {GOAL_PERIODS.map(period => (
                              <SelectItem key={period.value} value={period.value}>
                                {period.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Target</Label>
                        <Input 
                          type="number" 
                          value={goal.target}
                          onChange={e => {
                            const updatedGoal = { ...goal, target: parseInt(e.target.value) || 0 };
                            const index = goalsWithProgress.findIndex(g => g.id === goal.id);
                            goalsWithProgress[index] = updatedGoal;
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Unit</Label>
                        <Input 
                          value={goal.unit}
                          onChange={e => {
                            const updatedGoal = { ...goal, unit: e.target.value };
                            const index = goalsWithProgress.findIndex(g => g.id === goal.id);
                            goalsWithProgress[index] = updatedGoal;
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            }
            
            // Display mode for the goal
            return (
              <Card key={goal.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-md font-medium">{goal.name}</CardTitle>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(goal.id)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(goal.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center py-4">
                    <ProgressCircle 
                      value={progress} 
                      size={120} 
                      strokeWidth={12}
                      showPercentage={true}
                      valueLabel={`${goal.current.toLocaleString()} / ${goal.target.toLocaleString()} ${goal.unit}`}
                    />
                  </div>
                  <div className="text-center mt-2">
                    <p className="text-sm text-muted-foreground">
                      {goal.period.charAt(0).toUpperCase() + goal.period.slice(1)} goal
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ExerciseGoals;
