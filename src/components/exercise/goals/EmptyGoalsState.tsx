
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';

interface EmptyGoalsStateProps {
  onAddGoal: () => void;
}

const EmptyGoalsState: React.FC<EmptyGoalsStateProps> = ({ onAddGoal }) => {
  return (
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
          onClick={onAddGoal}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Your First Goal
        </Button>
      </div>
    </Card>
  );
};

export default EmptyGoalsState;
