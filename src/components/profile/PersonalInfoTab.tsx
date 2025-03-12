
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

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
        <Input 
          id="birthDate"
          type="date"
          value={isValidDate ? format(birthDate, 'yyyy-MM-dd') : ''}
          onChange={(e) => {
            const newDate = new Date(e.target.value);
            if (!isNaN(newDate.getTime())) {
              handleDateChange(newDate);
            }
          }}
        />
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
