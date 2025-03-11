
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit2, Save, Trash2, X } from 'lucide-react';
import ProgressCircle from '@/components/ProgressCircle';
import { ExerciseGoal } from '@/hooks/useExerciseGoals';
import { GOAL_TYPES, GOAL_PERIODS } from './constants';

interface GoalCardProps {
  goal: ExerciseGoal;
  isEditing: boolean;
  onEdit: (id: string) => void;
  onSave: (goal: ExerciseGoal) => void;
  onCancelEdit: () => void;
  onDelete: (id: string) => void;
  goalsWithProgress: ExerciseGoal[];
}

const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  isEditing,
  onEdit,
  onSave,
  onCancelEdit,
  onDelete,
  goalsWithProgress
}) => {
  const progress = Math.round((goal.current / goal.target) * 100);
  
  if (isEditing) {
    return (
      <Card>
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
            <Button variant="ghost" size="icon" onClick={() => onSave(goal)}>
              <Save className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onCancelEdit}>
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
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-md font-medium">{goal.name}</CardTitle>
        <div className="flex space-x-1">
          <Button variant="ghost" size="icon" onClick={() => onEdit(goal.id)}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(goal.id)}>
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
            allowExceedGoal={true}
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
};

export default GoalCard;
