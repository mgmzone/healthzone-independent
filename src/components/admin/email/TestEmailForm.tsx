
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TestEmailFormProps {
  testEmail: string;
  setTestEmail: (email: string) => void;
  handleTestEmail: () => void;
  isLoading: boolean;
}

const TestEmailForm: React.FC<TestEmailFormProps> = ({ 
  testEmail, 
  setTestEmail, 
  handleTestEmail, 
  isLoading 
}) => {
  return (
    <div className="border-t pt-4">
      <Label htmlFor="test_email">Test Email</Label>
      <div className="flex space-x-2 mt-1">
        <Input 
          id="test_email"
          type="email"
          placeholder="Enter email to send test"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
        />
        <Button 
          type="button" 
          variant="outline"
          onClick={handleTestEmail}
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send Test'}
        </Button>
      </div>
    </div>
  );
};

export default TestEmailForm;
