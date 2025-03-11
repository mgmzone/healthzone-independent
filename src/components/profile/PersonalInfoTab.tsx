
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TabsContent } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface PersonalInfoTabProps {
  formData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    birthDate?: Date;
    gender?: string;
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
  
  // Update birth date when year, month, or day changes
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value);
    const newDate = new Date(birthDate);
    newDate.setFullYear(newYear);
    
    // Check if the date is valid (handles leap years, etc.)
    if (!isNaN(newDate.getTime())) {
      handleDateChange('birthDate', newDate.toISOString().split('T')[0]);
    }
  };
  
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value);
    const newDate = new Date(birthDate);
    newDate.setMonth(newMonth);
    
    // Check if the date is valid
    if (!isNaN(newDate.getTime())) {
      handleDateChange('birthDate', newDate.toISOString().split('T')[0]);
    }
  };
  
  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDay = parseInt(e.target.value);
    const newDate = new Date(birthDate);
    newDate.setDate(newDay);
    
    // Check if the date is valid
    if (!isNaN(newDate.getTime())) {
      handleDateChange('birthDate', newDate.toISOString().split('T')[0]);
    }
  };
  
  // Generate days based on month and year (accounting for leap years)
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const daysInMonth = isValidDate ? getDaysInMonth(birthYear, birthMonth) : 31;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <TabsContent value="personal" className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName || ''}
            onChange={handleInputChange}
            placeholder="First Name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
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
        <Label htmlFor="email">Email</Label>
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
        <Label htmlFor="birthDate">Birth Date</Label>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Select value={birthMonth.toString()} onValueChange={(value) => handleMonthChange({ target: { value } } as React.ChangeEvent<HTMLSelectElement>)}>
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
          </div>
          <div>
            <Select value={birthDay.toString()} onValueChange={(value) => handleDayChange({ target: { value } } as React.ChangeEvent<HTMLSelectElement>)}>
              <SelectTrigger>
                <SelectValue placeholder="Day" />
              </SelectTrigger>
              <SelectContent>
                {days.map(day => (
                  <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={birthYear.toString()} onValueChange={(value) => handleYearChange({ target: { value } } as React.ChangeEvent<HTMLSelectElement>)}>
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
      </div>
      <div className="space-y-2">
        <Label htmlFor="gender">Gender</Label>
        <Select name="gender" value={formData.gender || ''} onValueChange={(value) => handleSelectChange('gender', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </TabsContent>
  );
};

export default PersonalInfoTab;
