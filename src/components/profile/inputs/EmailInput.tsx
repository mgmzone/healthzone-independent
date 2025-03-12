
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EmailInputProps {
  email?: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const EmailInput: React.FC<EmailInputProps> = ({
  email,
  handleInputChange
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="email" className="text-left block">Email</Label>
      <Input
        id="email"
        name="email"
        value={email || ''}
        onChange={handleInputChange}
        placeholder="Email"
        disabled
      />
    </div>
  );
};

export default EmailInput;
