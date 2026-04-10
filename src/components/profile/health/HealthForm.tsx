
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import WeightInputField from '@/components/periods/WeightInputField';

interface HealthFormProps {
  formData: {
    height?: number;
    fitnessLevel?: string;
    exerciseMinutesPerDay?: number;
    targetMealsPerDay?: number;
    healthGoals?: string;
    measurementUnit?: string;
    claudeApiKey?: string;
    aiPrompt?: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleNumberChange: (name: string, value: string) => void;
}

const HealthForm: React.FC<HealthFormProps> = ({
  formData,
  handleInputChange,
  handleSelectChange,
  handleNumberChange
}) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const unit = formData.measurementUnit || 'imperial';
  const isImperial = unit === 'imperial';
  
  // Handle fitness level changes
  const onFitnessLevelChange = (value: string) => {
    console.log("Fitness level changed to:", value);
    handleSelectChange('fitnessLevel', value);
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WeightInputField
          id="height"
          label="Height"
          value={formData.height?.toString() || ''}
          onChange={(value) => handleNumberChange('height', value)}
          weightUnit={isImperial ? 'in' : 'cm'}
          type="number"
          step="0.01"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fitnessLevel" className="text-left block">Fitness Level</Label>
          <Select 
            value={formData.fitnessLevel || 'moderate'} 
            onValueChange={onFitnessLevelChange}
          >
            <SelectTrigger id="fitnessLevel">
              <SelectValue placeholder="Select fitness level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sedentary">Sedentary</SelectItem>
              <SelectItem value="light">Light Activity</SelectItem>
              <SelectItem value="moderate">Moderate Activity</SelectItem>
              <SelectItem value="active">Active</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="exerciseMinutesPerDay" className="text-left block">Minutes of Exercise Per Day</Label>
          <Input
            id="exerciseMinutesPerDay"
            name="exerciseMinutesPerDay"
            type="number"
            inputMode="numeric"
            value={formData.exerciseMinutesPerDay || ''}
            onChange={(e) => handleNumberChange('exerciseMinutesPerDay', e.target.value)}
            placeholder="Exercise Minutes Per Day"
            step="1"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="targetMealsPerDay" className="text-left block">Meals Per Day</Label>
          <Select
            value={String(formData.targetMealsPerDay || 3)}
            onValueChange={(value) => handleNumberChange('targetMealsPerDay', value)}
          >
            <SelectTrigger id="targetMealsPerDay">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 (OMAD)</SelectItem>
              <SelectItem value="2">2 meals</SelectItem>
              <SelectItem value="3">3 meals</SelectItem>
              <SelectItem value="4">4 meals</SelectItem>
              <SelectItem value="5">5 meals</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="healthGoals" className="text-left block">Health Goals</Label>
        <Textarea
          id="healthGoals"
          name="healthGoals"
          value={formData.healthGoals || ''}
          onChange={handleInputChange}
          placeholder="Describe your health goals..."
          rows={4}
        />
      </div>

      <div className="border-t pt-6 mt-6 space-y-4">
        <h3 className="text-lg font-semibold">AI Settings</h3>

        <div className="space-y-2">
          <Label htmlFor="aiPrompt" className="text-left block">AI Instructions</Label>
          <Textarea
            id="aiPrompt"
            name="aiPrompt"
            value={formData.aiPrompt || ''}
            onChange={handleInputChange}
            placeholder="Tell AI about your dietary goals, restrictions, surgery prep requirements... e.g. 'I am preparing for bariatric surgery. I need high protein (130-150g/day), low carb meals. Flag any irritants like tomato, citrus, caffeine.'"
            rows={4}
          />
          <p className="text-sm text-muted-foreground">
            This context is sent to Claude when evaluating your meals and generating dashboard feedback.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="claudeApiKey" className="text-left block">Claude API Key</Label>
          <div className="flex gap-2">
            <Input
              id="claudeApiKey"
              name="claudeApiKey"
              type={showApiKey ? 'text' : 'password'}
              value={formData.claudeApiKey || ''}
              onChange={handleInputChange}
              placeholder="sk-ant-api03-..."
              className="font-mono"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setShowApiKey(!showApiKey)}
            >
              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Your personal Anthropic API key. Used for AI meal evaluation and dashboard insights.
            Get one at{' '}
            <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="underline">
              console.anthropic.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default HealthForm;
