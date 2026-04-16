import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AdditionalNutritionSectionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carbsGrams: string;
  setCarbsGrams: (value: string) => void;
  fatGrams: string;
  setFatGrams: (value: string) => void;
  sodiumMg: string;
  setSodiumMg: (value: string) => void;
  calories: string;
  setCalories: (value: string) => void;
}

const AdditionalNutritionSection: React.FC<AdditionalNutritionSectionProps> = ({
  open,
  onOpenChange,
  carbsGrams,
  setCarbsGrams,
  fatGrams,
  setFatGrams,
  sodiumMg,
  setSodiumMg,
  calories,
  setCalories,
}) => {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <div className="flex items-center justify-between mb-2">
        <Label>Additional Nutrition (Optional)</Label>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="px-2 h-8 w-9">
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="carbs-grams">Carbs (g)</Label>
            <Input
              id="carbs-grams"
              type="number"
              step="0.1"
              min="0"
              value={carbsGrams}
              onChange={(e) => setCarbsGrams(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fat-grams">Fat (g)</Label>
            <Input
              id="fat-grams"
              type="number"
              step="0.1"
              min="0"
              value={fatGrams}
              onChange={(e) => setFatGrams(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sodium-mg">Sodium (mg)</Label>
            <Input
              id="sodium-mg"
              type="number"
              step="1"
              min="0"
              value={sodiumMg}
              onChange={(e) => setSodiumMg(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="calories">Calories</Label>
            <Input
              id="calories"
              type="number"
              step="1"
              min="0"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default AdditionalNutritionSection;
