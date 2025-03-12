
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface GenderSelectorProps {
  gender?: string;
  onGenderChange: (value: string) => void;
}

const GenderSelector: React.FC<GenderSelectorProps> = ({ gender, onGenderChange }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="gender" className="text-left block">Gender</Label>
      <Select 
        value={gender || 'other'} 
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
  );
};

export default GenderSelector;
