
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import HealthForm from './health/HealthForm';

interface HealthInfoTabProps {
  formData: {
    startingWeight?: number;
    currentWeight?: number;
    targetWeight?: number;
    measurementUnit?: string;
    height?: number;
    fitnessLevel?: string;
    exerciseMinutesPerDay?: number;
    targetMealsPerDay?: number;
    healthGoals?: string;
    claudeApiKey?: string;
    aiPrompt?: string;
    proteinTargetMin?: number;
    proteinTargetMax?: number;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleNumberChange: (name: string, value: string) => void;
}

const HealthInfoTab: React.FC<HealthInfoTabProps> = ({
  formData,
  handleInputChange,
  handleSelectChange,
  handleNumberChange
}) => {
  return (
    <HealthForm
      formData={formData}
      handleInputChange={handleInputChange}
      handleSelectChange={handleSelectChange}
      handleNumberChange={handleNumberChange}
    />
  );
};

export default HealthInfoTab;
