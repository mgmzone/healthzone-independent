
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useEmailPreferences } from '@/hooks/useEmailPreferences';

interface EmailPreferencesSectionProps {
  className?: string;
}

const EmailPreferencesSection: React.FC<EmailPreferencesSectionProps> = ({ className }) => {
  const { 
    preferences, 
    isLoading, 
    isSaving, 
    updatePreferences 
  } = useEmailPreferences();

  const handleWeeklySummaryChange = (checked: boolean) => {
    updatePreferences({ weeklyEmails: checked });
  };

  const handleSystemNotificationsChange = (checked: boolean) => {
    updatePreferences({ systemEmails: checked });
  };

  return (
    <div className={className}>
      <h3 className="text-lg font-medium mb-4">Email Preferences</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="weekly-summary">Weekly summary emails</Label>
            <p className="text-sm text-muted-foreground">
              Receive a weekly summary of your health tracking activities
            </p>
          </div>
          <Switch
            id="weekly-summary"
            checked={preferences.weeklyEmails}
            onCheckedChange={handleWeeklySummaryChange}
            disabled={isLoading || isSaving}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="system-notifications">System notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive reminders about completing your profile and tracking activities
            </p>
          </div>
          <Switch
            id="system-notifications"
            checked={preferences.systemEmails}
            onCheckedChange={handleSystemNotificationsChange}
            disabled={isLoading || isSaving}
          />
        </div>
      </div>
    </div>
  );
};

export default EmailPreferencesSection;
