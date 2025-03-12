
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface NameInputsProps {
  firstName?: string;
  lastName?: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const NameInputs: React.FC<NameInputsProps> = ({
  firstName,
  lastName,
  handleInputChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="firstName" className="text-left block">First Name</Label>
        <Input
          id="firstName"
          name="firstName"
          value={firstName || ''}
          onChange={handleInputChange}
          placeholder="First Name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="lastName" className="text-left block">Last Name</Label>
        <Input
          id="lastName"
          name="lastName"
          value={lastName || ''}
          onChange={handleInputChange}
          placeholder="Last Name"
        />
      </div>
    </div>
  );
};

export default NameInputs;
