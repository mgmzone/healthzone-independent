
import React, { useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BirthDateSelectorProps {
  birthDate?: Date;
  handleMonthChange: (value: string) => void;
  handleDayChange: (value: string) => void;
  handleYearChange: (value: string) => void;
}

const BirthDateSelector: React.FC<BirthDateSelectorProps> = ({
  birthDate,
  handleMonthChange,
  handleDayChange,
  handleYearChange
}) => {
  // Ensure the birthDate is a valid Date object
  const isValidDate = birthDate instanceof Date && !isNaN(birthDate.getTime());
  
  // Use UTC methods to avoid timezone issues
  const birthYear = isValidDate ? birthDate!.getUTCFullYear() : undefined;
  const birthMonth = isValidDate ? birthDate!.getUTCMonth() : undefined; // 0-11
  const birthDay = isValidDate ? birthDate!.getUTCDate() : undefined; // 1-31
  
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
    // Use the next month and day 0 to get the last day of the current month
    const daysInMonth = new Date(Date.UTC(birthYear, birthMonth + 1, 0)).getUTCDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [birthMonth, birthYear]);

  return (
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
  );
};

export default BirthDateSelector;
