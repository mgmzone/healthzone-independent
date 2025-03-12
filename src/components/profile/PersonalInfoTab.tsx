
import React from 'react';
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
  handleDateChange: (name: string, value: string) => void;
}

const PersonalInfoTab: React.FC<PersonalInfoTabProps> = ({
  formData,
  handleInputChange,
  handleSelectChange,
  handleDateChange
}) => {
  // Ensure the birthDate is a valid Date object
  const isValidDate = formData.birthDate instanceof Date && !isNaN(formData.birthDate.getTime());
  const birthDate = isValidDate ? formData.birthDate : new Date();

  // Generate year options for the dropdown (120 years back)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 120 }, (_, i) => currentYear - i);
  
  const birthYear = birthDate.getFullYear();
  const birthMonth = birthDate.getMonth(); // 0-11
  const birthDay = birthDate.getDate();
  
  const handleYearChange = (value: string) => {
    const newYear = parseInt(value);
    const newDate = new Date(birthDate);
    newDate.setFullYear(newYear);
    
    if (!isNaN(newDate.getTime())) {
      handleDateChange('birthDate', newDate.toISOString().split('T')[0]);
    }
  };
  
  const handleMonthChange = (value: string) => {
    const newMonth = parseInt(value);
    const newDate = new Date(birthDate);
    newDate.setMonth(newMonth);
    
    if (!isNaN(newDate.getTime())) {
      handleDateChange('birthDate', newDate.toISOString().split('T')[0]);
    }
  };
  
  const handleDayChange = (value: string) => {
    const newDay = parseInt(value);
    const newDate = new Date(birthDate);
    newDate.setDate(newDay);
    
    if (!isNaN(newDate.getTime())) {
      handleDateChange('birthDate', newDate.toISOString().split('T')[0]);
    }
  };
  
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const daysInMonth = isValidDate ? getDaysInMonth(birthYear, birthMonth) : 31;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

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
          <Select value={birthMonth.toString()} onValueChange={handleMonthChange}>
            <SelectTrigger>
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">January</SelectItem>
              <SelectItem value="1">February</SelectItem>
              <SelectItem value="2">March</SelectItem>
              <SelectItem value="3">April</SelectItem>
              <SelectItem value="4">May</SelectItem>
              <SelectItem value="5">June</SelectItem>
              <SelectItem value="6">July</SelectItem>
              <SelectItem value="7">August</SelectItem>
              <SelectItem value="8">September</SelectItem>
              <SelectItem value="9">October</SelectItem>
              <SelectItem value="10">November</SelectItem>
              <SelectItem value="11">December</SelectItem>
            </SelectContent>
          </Select>
          <Select value={birthDay.toString()} onValueChange={handleDayChange}>
            <SelectTrigger>
              <SelectValue placeholder="Day" />
            </SelectTrigger>
            <SelectContent>
              {days.map(day => (
                <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={birthYear.toString()} onValueChange={handleYearChange}>
            <SelectTrigger>
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent className="h-[200px] overflow-y-auto">
              {years.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="gender" className="text-left block">Gender</Label>
          <Select 
            value={formData.gender || 'other'} 
            onValueChange={(value) => handleSelectChange('gender', value)}
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
            onValueChange={(value) => handleSelectChange('measurementUnit', value)}
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
