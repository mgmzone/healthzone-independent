
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Save, RefreshCw } from 'lucide-react';

// Email template types
type EmailType = 'profile_completion' | 'inactivity_reminder' | 'weekly_summary';

// Template interface
interface EmailTemplate {
  id: string;
  type: EmailType;
  subject: string;
  html_content: string;
  is_active: boolean;
  created_at: string;
}

// Template form values
interface TemplateFormValues {
  id?: string;
  subject: string;
  html_content: string;
}

// Component to display placeholders help
const PlaceholdersHelp: React.FC<{ type: EmailType }> = ({ type }) => {
  const commonPlaceholders = [
    { name: 'name', description: 'User\'s name' },
    { name: 'appUrl', description: 'Application URL' },
  ];

  const specificPlaceholders = {
    'weekly_summary': [
      { name: 'weighIns', description: 'Number of weight entries' },
      { name: 'fastingDays', description: 'Number of fasting days' },
      { name: 'exercises', description: 'Number of exercise entries' },
    ],
    'profile_completion': [],
    'inactivity_reminder': []
  };

  const placeholders = [...commonPlaceholders, ...(specificPlaceholders[type] || [])];

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-md">
      <h4 className="text-sm font-medium mb-2">Available placeholders:</h4>
      <ul className="space-y-1 text-sm">
        {placeholders.map((p) => (
          <li key={p.name}>
            <code className="bg-gray-200 px-1 py-0.5 rounded">{'{{' + p.name + '}}'}</code> - {p.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

const EmailTemplatesManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTemplate, setActiveTemplate] = useState<EmailType>('weekly_summary');
  const [formValues, setFormValues] = useState<TemplateFormValues>({
    subject: '',
    html_content: '',
  });
  const [isTesting, setIsTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  // Fetch email templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ['emailTemplates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as EmailTemplate[];
    }
  });

  // Update template mutation
  const updateTemplate = useMutation({
    mutationFn: async (values: TemplateFormValues) => {
      if (values.id) {
        // Update existing template
        const { error } = await supabase
          .from('email_templates')
          .update({
            subject: values.subject,
            html_content: values.html_content,
            updated_at: new Date().toISOString()
          })
          .eq('id', values.id);
        
        if (error) throw error;
      } else {
        // Create new template
        const { error } = await supabase
          .from('email_templates')
          .insert({
            type: activeTemplate,
            subject: values.subject,
            html_content: values.html_content,
            is_active: true
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
      toast.success('Template saved successfully');
    },
    onError: (error) => {
      toast.error(`Failed to save template: ${error.message}`);
    }
  });

  // Send test email mutation
  const sendTestEmail = useMutation({
    mutationFn: async () => {
      // Prepare test data
      const testData = {
        type: activeTemplate,
        email: testEmail,
        name: 'Test User',
        data: {
          appUrl: window.location.origin,
          weighIns: 3,
          fastingDays: 2,
          exercises: 5
        }
      };

      // Call the send-email edge function
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: testData
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success(`Test email sent to ${testEmail}`);
      setIsTesting(false);
    },
    onError: (error) => {
      toast.error(`Failed to send test email: ${error.message}`);
      setIsTesting(false);
    }
  });

  // Handle template change
  React.useEffect(() => {
    if (templates && templates.length > 0) {
      const template = templates.find(t => t.type === activeTemplate && t.is_active);
      if (template) {
        setFormValues({
          id: template.id,
          subject: template.subject,
          html_content: template.html_content
        });
      }
    }
  }, [activeTemplate, templates]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTemplate.mutate(formValues);
  };

  // Handle test email submission
  const handleTestEmail = () => {
    if (!testEmail) {
      toast.error('Please enter a test email address');
      return;
    }
    setIsTesting(true);
    sendTestEmail.mutate();
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><RefreshCw className="animate-spin h-8 w-8 text-gray-400" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Mail className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold">Email Template Manager</h2>
      </div>

      <Tabs defaultValue="weekly_summary" value={activeTemplate} onValueChange={(value) => setActiveTemplate(value as EmailType)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="weekly_summary">Weekly Summary</TabsTrigger>
          <TabsTrigger value="profile_completion">Profile Completion</TabsTrigger>
          <TabsTrigger value="inactivity_reminder">Inactivity Reminder</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTemplate}>
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTemplate === 'weekly_summary' && 'Weekly Summary Email'}
                {activeTemplate === 'profile_completion' && 'Profile Completion Reminder'}
                {activeTemplate === 'inactivity_reminder' && 'Inactivity Reminder Email'}
              </CardTitle>
              <CardDescription>
                {activeTemplate === 'weekly_summary' && 'Customize the weekly summary email sent to users.'}
                {activeTemplate === 'profile_completion' && 'Edit the reminder email sent to users with incomplete profiles.'}
                {activeTemplate === 'inactivity_reminder' && 'Edit the reminder email sent to inactive users.'}
              </CardDescription>
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
                      disabled={isTesting || sendTestEmail.isPending}
                    >
                      {isTesting ? 'Sending...' : 'Send Test'}
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="submit" disabled={updateTemplate.isPending}>
                  {updateTemplate.isPending ? (
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailTemplatesManager;
