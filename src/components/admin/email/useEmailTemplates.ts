
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EmailType } from '@/lib/services/emailService';
import { EmailTemplate, TemplateFormValues } from './types';

export function useEmailTemplates() {
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
  useEffect(() => {
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

  return {
    activeTemplate,
    setActiveTemplate,
    formValues,
    setFormValues,
    testEmail,
    setTestEmail,
    isTesting,
    isLoading,
    templates,
    handleSubmit,
    handleTestEmail,
    isSaving: updateTemplate.isPending
  };
}
