
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Save, RefreshCw } from 'lucide-react';
import { EmailType } from '@/lib/services/emailService';
import { TemplateFormValues } from './types';
import PlaceholdersHelp from './PlaceholdersHelp';
import TestEmailForm from './TestEmailForm';

interface TemplateFormProps {
  activeTemplate: EmailType;
  formValues: TemplateFormValues;
  setFormValues: (values: TemplateFormValues) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isSaving: boolean;
  testEmail: string;
  setTestEmail: (email: string) => void;
  handleTestEmail: () => void;
  isTesting: boolean;
}

const TemplateForm: React.FC<TemplateFormProps> = ({
  activeTemplate,
  formValues,
  setFormValues,
  handleSubmit,
  isSaving,
  testEmail,
  setTestEmail,
  handleTestEmail,
  isTesting
}) => {
  const getTemplateTitle = (type: EmailType) => {
    switch (type) {
      case 'weekly_summary': return 'Weekly Summary Email';
      case 'profile_completion': return 'Profile Completion Reminder';
      case 'inactivity_reminder': return 'Inactivity Reminder Email';
      default: return 'Email Template';
    }
  };

  const getTemplateDescription = (type: EmailType) => {
    switch (type) {
      case 'weekly_summary': return 'Customize the weekly summary email sent to users.';
      case 'profile_completion': return 'Edit the reminder email sent to users with incomplete profiles.';
      case 'inactivity_reminder': return 'Edit the reminder email sent to inactive users.';
      default: return 'Edit email template';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{getTemplateTitle(activeTemplate)}</CardTitle>
        <CardDescription>{getTemplateDescription(activeTemplate)}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input 
              id="subject" 
              value={formValues.subject} 
              onChange={(e) => setFormValues({...formValues, subject: e.target.value})}
              placeholder="Email subject"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="html_content">Email Content (HTML)</Label>
            <Textarea 
              id="html_content" 
              value={formValues.html_content} 
              onChange={(e) => setFormValues({...formValues, html_content: e.target.value})}
              placeholder="Enter HTML content for the email"
              className="min-h-[300px] font-mono text-sm"
              required
            />
          </div>

          <PlaceholdersHelp type={activeTemplate} />

          <TestEmailForm 
            testEmail={testEmail}
            setTestEmail={setTestEmail}
            handleTestEmail={handleTestEmail}
            isLoading={isTesting}
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Template
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default TemplateForm;
