
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from 'date-fns';
import { cn } from "@/lib/utils";

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
  const birthDate = isValidDate ? formData.birthDate : new Date();
  
  // Handle gender value changes
  const onGenderChange = (value: string) => {
    console.log("Gender changed to:", value);
    handleSelectChange('gender', value);
  };
  
  // Handle measurement unit value changes
  const onMeasurementUnitChange = (value: string) => {
    console.log("Measurement unit changed to:", value);
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
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="birthDate"
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !isValidDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {isValidDate ? format(birthDate, "PPP") : <span>Select date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={birthDate}
              onSelect={(date) => date && handleDateChange(date)}
              initialFocus
              className="pointer-events-auto"
              disabled={(date) => date > new Date()}
              fromYear={1900}
              toYear={new Date().getFullYear()}
              captionLayout="dropdown-buttons"
              defaultMonth={new Date(1990, 0)}
            />
          </PopoverContent>
        </Popover>
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
