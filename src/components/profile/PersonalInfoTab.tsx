
import React from 'react';
import NameInputs from './inputs/NameInputs';
import EmailInput from './inputs/EmailInput';
import BirthDateSelector from './birthdate/BirthDateSelector';
import GenderSelector from './selectors/GenderSelector';
import MeasurementUnitSelector from './selectors/MeasurementUnitSelector';
import WeightInputField from '@/components/periods/WeightInputField';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  handleYearChangeHelper,
  handleMonthChangeHelper,
  handleDayChangeHelper
} from './birthdate/birthDateHelpers';

interface PersonalInfoTabProps {
  formData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    birthDate?: Date;
    gender?: string;
    measurementUnit?: string;
    height?: number;
    fitnessLevel?: string;
    exerciseMinutesPerDay?: number;
    healthGoals?: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleDateChange: (date: Date) => void;
  handleNumberChange: (name: string, value: string) => void;
}

const PersonalInfoTab: React.FC<PersonalInfoTabProps> = ({
  formData,
  handleInputChange,
  handleSelectChange,
  handleDateChange,
  handleNumberChange
}) => {
  // Handle year change
  const handleYearChange = (value: string) => {
    const isValidDate = formData.birthDate instanceof Date && !isNaN(formData.birthDate.getTime());
    const birthMonth = isValidDate ? formData.birthDate!.getUTCMonth() : undefined;
    const birthDay = isValidDate ? formData.birthDate!.getUTCDate() : undefined;
    
    handleYearChangeHelper(value, birthMonth, birthDay, handleDateChange);
  };
  
  // Handle month change
  const handleMonthChange = (value: string) => {
    const isValidDate = formData.birthDate instanceof Date && !isNaN(formData.birthDate.getTime());
    const birthYear = isValidDate ? formData.birthDate!.getUTCFullYear() : undefined;
    const birthDay = isValidDate ? formData.birthDate!.getUTCDate() : undefined;
    
    handleMonthChangeHelper(value, birthYear, birthDay, handleDateChange);
  };
  
  // Handle day change
  const handleDayChange = (value: string) => {
    const isValidDate = formData.birthDate instanceof Date && !isNaN(formData.birthDate.getTime());
    const birthYear = isValidDate ? formData.birthDate!.getUTCFullYear() : undefined;
    const birthMonth = isValidDate ? formData.birthDate!.getUTCMonth() : undefined;
    
    handleDayChangeHelper(value, birthYear, birthMonth, handleDateChange);
  };
  
  // Handle gender value changes
  const onGenderChange = (value: string) => {
    handleSelectChange('gender', value);
  };
  
  // Handle measurement unit value changes
  const onMeasurementUnitChange = (value: string) => {
    handleSelectChange('measurementUnit', value);
  };
  
  // Handle fitness level changes
  const onFitnessLevelChange = (value: string) => {
    console.log("Fitness level changed to:", value);
    handleSelectChange('fitnessLevel', value);
  };
  
  const unit = formData.measurementUnit || 'imperial';
  const isImperial = unit === 'imperial';
  
  return (
    <div className="space-y-6">
      {/* Name inputs */}
      <NameInputs 
        firstName={formData.firstName}
        lastName={formData.lastName}
        handleInputChange={handleInputChange}
      />
      
      {/* Email and Birth Date on the same line */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EmailInput 
          email={formData.email}
          handleInputChange={handleInputChange}
        />
        <BirthDateSelector 
          birthDate={formData.birthDate}
          handleMonthChange={handleMonthChange}
          handleDayChange={handleDayChange}
          handleYearChange={handleYearChange}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GenderSelector 
          gender={formData.gender}
          onGenderChange={onGenderChange}
        />
        <MeasurementUnitSelector 
          measurementUnit={formData.measurementUnit}
          onMeasurementUnitChange={onMeasurementUnitChange}
        />
      </div>
      
      {/* Health-related fields moved from HealthForm */}
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
    </div>
  );
};

export default PersonalInfoTab;
