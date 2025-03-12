
import React, { useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  // Ensure the birthDate is a valid Date object
  const isValidDate = formData.birthDate instanceof Date && !isNaN(formData.birthDate.getTime());
  
  // Extract date components if we have a valid date
  const birthYear = isValidDate ? formData.birthDate!.getFullYear() : undefined;
  const birthMonth = isValidDate ? formData.birthDate!.getMonth() : undefined; // 0-11
  const birthDay = isValidDate ? formData.birthDate!.getDate() : undefined; // 1-31
  
  // Generate arrays for the dropdown options
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);
  }, []);
  
  const months = useMemo(() => [
    { value: 0, label: 'January' },
    { value: 1, label: 'February' },
    { value: 2, label: 'March' },
    { value: 3, label: 'April' },
    { value: 4, label: 'May' },
    { value: 5, label: 'June' },
    { value: 6, label: 'July' },
    { value: 7, label: 'August' },
    { value: 8, label: 'September' },
    { value: 9, label: 'October' },
    { value: 10, label: 'November' },
    { value: 11, label: 'December' }
  ], []);
  
  // Generate days based on selected month and year
  const days = useMemo(() => {
    if (birthMonth === undefined || birthYear === undefined) {
      return Array.from({ length: 31 }, (_, i) => i + 1);
    }
    
    // Get the number of days in the selected month/year
    const daysInMonth = new Date(birthYear, birthMonth + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [birthMonth, birthYear]);
  
  // Handle year change
  const handleYearChange = (value: string) => {
    const year = parseInt(value, 10);
    if (!isNaN(year)) {
      const newDate = new Date(
        year,
        birthMonth !== undefined ? birthMonth : 0,
        birthDay !== undefined ? birthDay : 1
      );
      handleDateChange(newDate);
    }
  };
  
  // Handle month change
  const handleMonthChange = (value: string) => {
    const month = parseInt(value, 10);
    if (!isNaN(month)) {
      const year = birthYear || new Date().getFullYear();
      let day = birthDay || 1;
      
      // Check if the day is valid for this month
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      if (day > daysInMonth) {
        day = daysInMonth;
      }
      
      const newDate = new Date(year, month, day);
      handleDateChange(newDate);
    }
  };
  
  // Handle day change
  const handleDayChange = (value: string) => {
    const day = parseInt(value, 10);
    if (!isNaN(day)) {
      const year = birthYear || new Date().getFullYear();
      const month = birthMonth !== undefined ? birthMonth : 0;
      
      const newDate = new Date(year, month, day);
      handleDateChange(newDate);
    }
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-left block">First Name</Label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName || ''}
            onChange={handleInputChange}
            placeholder="First Name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-left block">Last Name</Label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName || ''}
            onChange={handleInputChange}
            placeholder="Last Name"
          />
        </div>
      </div>
      
      {/* Email and Birth Date on the same line */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-left block">Email</Label>
          <Input
            id="email"
            name="email"
            value={formData.email || ''}
            onChange={handleInputChange}
            placeholder="Email"
            disabled
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="birthDate" className="text-left block">Birth Date</Label>
          <div className="grid grid-cols-3 gap-2">
            {/* Month dropdown */}
            <Select
              value={birthMonth !== undefined ? birthMonth.toString() : ''}
              onValueChange={handleMonthChange}
            >
              <SelectTrigger id="birthMonth">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Day dropdown */}
            <Select
              value={birthDay !== undefined ? birthDay.toString() : ''}
              onValueChange={handleDayChange}
            >
              <SelectTrigger id="birthDay">
                <SelectValue placeholder="Day" />
              </SelectTrigger>
              <SelectContent>
                {days.map((day) => (
                  <SelectItem key={day} value={day.toString()}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Year dropdown */}
            <Select
              value={birthYear !== undefined ? birthYear.toString() : ''}
              onValueChange={handleYearChange}
            >
              <SelectTrigger id="birthYear">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="gender" className="text-left block">Gender</Label>
          <Select 
            value={formData.gender || 'other'} 
            onValueChange={onGenderChange}
          >
            <SelectTrigger id="gender">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="measurementUnit" className="text-left block">Measurement Unit</Label>
          <Select 
            value={formData.measurementUnit || 'imperial'} 
            onValueChange={onMeasurementUnitChange}
          >
            <SelectTrigger id="measurementUnit">
              <SelectValue placeholder="Select measurement unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="imperial">Imperial (lbs, in)</SelectItem>
              <SelectItem value="metric">Metric (kg, cm)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoTab;
