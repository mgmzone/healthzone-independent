
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2, Plus, Save, Trash2 } from 'lucide-react';
import ProgressCircle from '@/components/ProgressCircle';

// Placeholder data until we add goals to the database
const initialGoals = [
  { id: '1', name: 'Daily steps', target: 10000, current: 8120, unit: 'steps' },
  { id: '2', name: 'Weekly active minutes', target: 150, current: 90, unit: 'minutes' },
  { id: '3', name: 'Monthly walking distance', target: 80, current: 45, unit: 'km' }
];

const ExerciseGoals = () => {
  const [goals, setGoals] = useState(initialGoals);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState({ name: '', target: 0, current: 0, unit: '' });
  const [isAddingNew, setIsAddingNew] = useState(false);

  const handleEdit = (id: string) => {
    setEditingId(id);
  };

  const handleSave = (id: string) => {
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };

  const handleAddNew = () => {
    if (newGoal.name && newGoal.target > 0) {
      const id = Math.random().toString(36).substring(2, 9);
      setGoals([...goals, { id, ...newGoal }]);
      setNewGoal({ name: '', target: 0, current: 0, unit: '' });
      setIsAddingNew(false);
    }
  };

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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="goalName">Goal Name</Label>
                  <Input 
                    id="goalName" 
                    placeholder="e.g., Daily steps" 
                    value={newGoal.name}
                    onChange={e => setNewGoal({...newGoal, name: e.target.value})}
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
                  <Label htmlFor="goalCurrent">Current Value</Label>
                  <Input 
                    id="goalCurrent" 
                    type="number" 
                    placeholder="0" 
                    value={newGoal.current || ''}
                    onChange={e => setNewGoal({...newGoal, current: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              
              <Button onClick={handleAddNew} className="w-full mt-2">
                <Plus className="mr-2 h-4 w-4" /> Add Goal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map(goal => {
          const progress = Math.min(Math.round((goal.current / goal.target) * 100), 100);
          const isEditing = editingId === goal.id;
          
          return (
            <Card key={goal.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-md font-medium">{goal.name}</CardTitle>
                <div className="flex space-x-1">
                  {isEditing ? (
                    <Button variant="ghost" size="icon" onClick={() => handleSave(goal.id)}>
                      <Save className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(goal.id)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
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
                    valueLabel={`${goal.current} / ${goal.target} ${goal.unit}`}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ExerciseGoals;
