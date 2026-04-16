
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
      // Build realistic sample placeholders per template so admins can preview
      // the fully-rendered email, including dynamic HTML chunks the cron path
      // assembles in code.
      const appUrl = window.location.origin;
      const unsubscribeUrl = `${appUrl}/?preview=unsubscribe`;
      const baseData: Record<string, any> = { appUrl, unsubscribeUrl };

      if (activeTemplate === 'weekly_summary') {
        baseData.weighIns = 4;
        baseData.fastingDays = 5;
        baseData.exercises = 3;
        baseData.mealsLogged = 12;
        baseData.avgDailyProtein = 128;
        baseData.avgDailyCarbs = 140;
        baseData.avgDailyFat = 72;
        baseData.avgDailySodium = 2100;
        baseData.avgDailyCalories = 2040;
        baseData.irritantViolations = 1;
        baseData.goalCompliance = 86;
        baseData.aiSummary = 'Sample summary: steady progress this week with one irritant violation.';
        baseData.aiTip = 'Keep protein at the high end and add one more flexibility session next week.';
        baseData.statsGridHtml = `
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 20px;">
            <tr>
              <td width="33%" style="padding: 12px; background: #f0f9ff; border-radius: 8px; text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #2563eb;">4</div>
                <div style="font-size: 12px; color: #6b7280; margin-top: 2px;">Weigh-ins</div>
              </td>
              <td width="4"></td>
              <td width="33%" style="padding: 12px; background: #f0fdf4; border-radius: 8px; text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #16a34a;">3</div>
                <div style="font-size: 12px; color: #6b7280; margin-top: 2px;">Workouts</div>
              </td>
              <td width="4"></td>
              <td width="33%" style="padding: 12px; background: #fef3c7; border-radius: 8px; text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #d97706;">5</div>
                <div style="font-size: 12px; color: #6b7280; margin-top: 2px;">Fasting Days</div>
              </td>
            </tr>
          </table>`;
        baseData.nutritionHtml = `
          <div style="margin: 20px 0; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #374151;">Nutrition</h3>
            <p style="margin: 0; font-size: 14px; color: #6b7280;">12 meals logged &bull; 128g avg daily protein &bull; <span style="color: #dc2626;">1 irritant violation</span></p>
            <p style="margin: 4px 0 0; font-size: 13px; color: #6b7280;">Macros: ~140g carbs &bull; ~72g fat &bull; ~2100mg sodium &bull; ~2040 kcal / day</p>
            <p style="margin: 8px 0 0; font-size: 14px; color: #6b7280;">Daily goal compliance: <strong>86%</strong></p>
          </div>`;
        baseData.aiSectionHtml = `
          <div style="margin: 20px 0; padding: 15px; background-color: #f3f0ff; border-left: 4px solid #8b5cf6; border-radius: 4px;">
            <h3 style="margin: 0 0 8px 0; color: #6d28d9; font-size: 14px;">AI Coach Insights</h3>
            <p style="margin: 0 0 12px 0; color: #374151; font-size: 14px;">Sample summary: steady progress this week with one irritant violation.</p>
            <div style="margin-bottom: 8px;"><div style="color: #059669; font-size: 13px; margin-bottom: 4px;">&#10003; Protein average within target</div></div>
            <div style="margin-top: 8px; padding: 8px 12px; background-color: #fef9c3; border-radius: 4px; font-size: 13px; color: #854d0e;">&#128161; <strong>Tip:</strong> Keep protein at the high end and add one more flexibility session next week.</div>
          </div>`;
      } else if (activeTemplate === 'inactivity_reminder') {
        baseData.daysInactive = 14;
      } else if (activeTemplate === 'milestone_reminder') {
        baseData.milestoneName = 'Surgery';
        baseData.milestoneDateFormatted = 'Friday, May 1, 2026';
        baseData.countdownLabel = '1 week until';
        baseData.daysUntil = 7;
      }

      const testData = {
        type: activeTemplate,
        email: testEmail,
        name: 'Test User',
        data: baseData,
      };

      const { data, error } = await supabase.functions.invoke('send-email', { body: testData });
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
