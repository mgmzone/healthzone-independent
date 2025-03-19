
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Mail } from 'lucide-react';
import { EmailType } from '@/lib/services/emailService';
import { useEmailTemplates } from './email/useEmailTemplates';
import TemplateForm from './email/TemplateForm';

const EmailTemplatesManager: React.FC = () => {
  const {
    activeTemplate,
    setActiveTemplate,
    formValues,
    setFormValues,
    testEmail,
    setTestEmail,
    isTesting,
    isLoading,
    handleSubmit,
    handleTestEmail,
    isSaving
  } = useEmailTemplates();

  if (isLoading) {
    return <div className="flex justify-center p-8"><RefreshCw className="animate-spin h-8 w-8 text-gray-400" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Mail className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold">Email Template Manager</h2>
      </div>

      <Tabs 
        defaultValue="weekly_summary" 
        value={activeTemplate} 
        onValueChange={(value) => setActiveTemplate(value as EmailType)} 
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="weekly_summary">Weekly Summary</TabsTrigger>
          <TabsTrigger value="profile_completion">Profile Completion</TabsTrigger>
          <TabsTrigger value="inactivity_reminder">Inactivity Reminder</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTemplate}>
          <TemplateForm
            activeTemplate={activeTemplate}
            formValues={formValues}
            setFormValues={setFormValues}
            handleSubmit={handleSubmit}
            isSaving={isSaving}
            testEmail={testEmail}
            setTestEmail={setTestEmail}
            handleTestEmail={handleTestEmail}
            isTesting={isTesting}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailTemplatesManager;
