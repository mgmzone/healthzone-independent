
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from 'lucide-react';
import { ExerciseGoal } from '@/hooks/useExerciseGoals';
import { GOAL_TYPES, GOAL_PERIODS } from './constants';

interface NewGoalFormProps {
  newGoal: Partial<ExerciseGoal>;
  setNewGoal: React.Dispatch<React.SetStateAction<Partial<ExerciseGoal>>>;
  handleAddNew: () => void;
  handleCancelAdd: () => void;
}

const NewGoalForm: React.FC<NewGoalFormProps> = ({
  newGoal,
  setNewGoal,
  handleAddNew,
  handleCancelAdd
}) => {
  return (
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
  );
};

export default NewGoalForm;
