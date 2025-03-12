
import React from 'react';
import NameInputs from './inputs/NameInputs';
import EmailInput from './inputs/EmailInput';
import BirthDateSelector from './birthdate/BirthDateSelector';
import GenderSelector from './selectors/GenderSelector';
import MeasurementUnitSelector from './selectors/MeasurementUnitSelector';
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
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleDateChange: (date: Date) => void;
}

const PersonalInfoTab: React.FC<PersonalInfoTabProps> = ({
  formData,
  handleInputChange,
  handleSelectChange,
  handleDateChange
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
  
  return (
    <div className="space-y-4">
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
    </div>
  );
};

export default PersonalInfoTab;
