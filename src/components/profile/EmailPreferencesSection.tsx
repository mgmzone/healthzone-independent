import React, { useMemo } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEmailPreferences } from '@/hooks/useEmailPreferences';
import { TIME_ZONES, detectBrowserTimeZone, findTimeZoneOption } from '@/lib/timeZones';

interface EmailPreferencesSectionProps {
  className?: string;
}

const EmailPreferencesSection: React.FC<EmailPreferencesSectionProps> = ({ className }) => {
  const { preferences, isLoading, isSaving, updatePreferences } = useEmailPreferences();
  const disabled = isLoading || isSaving;

  // Group curated timezones for a grouped <Select>. If the user's stored tz
  // isn't in the curated list, show it as a "Current" entry so the select
  // can still display it for values we don't cover.
  const groupedZones = useMemo(() => {
    const groups = new Map<string, typeof TIME_ZONES>();
    for (const z of TIME_ZONES) {
      if (!groups.has(z.group)) groups.set(z.group, []);
      groups.get(z.group)!.push(z);
    }
    return Array.from(groups.entries());
  }, []);

  const storedZone = preferences.timeZone;
  const storedIsCurated = !!findTimeZoneOption(storedZone);
  const browserZone = detectBrowserTimeZone();
  const showBrowserHint =
    storedZone === 'UTC' && browserZone !== 'UTC' && browserZone !== storedZone;

  return (
    <div className={className}>
      <h3 className="text-lg font-medium mb-4">Email Preferences</h3>

      <div className="space-y-6">
        {/* Time zone — drives "today" for every email and picks which hour
            the daily-reminder cron fires for this user. */}
        <div className="space-y-2">
          <Label htmlFor="time-zone">Time zone</Label>
          <Select
            value={storedZone}
            onValueChange={(val) => updatePreferences({ timeZone: val })}
            disabled={disabled}
          >
            <SelectTrigger id="time-zone" className="max-w-md">
              <SelectValue placeholder="Select your time zone" />
            </SelectTrigger>
            <SelectContent>
              {!storedIsCurated && storedZone !== 'UTC' && (
                <SelectGroup>
                  <SelectLabel>Current</SelectLabel>
                  <SelectItem value={storedZone}>{storedZone}</SelectItem>
                </SelectGroup>
              )}
              {groupedZones.map(([group, zones]) => (
                <SelectGroup key={group}>
                  <SelectLabel>{group}</SelectLabel>
                  {zones.map((z) => (
                    <SelectItem key={z.id} value={z.id}>
                      {z.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
          {showBrowserHint && (
            <p className="text-xs text-muted-foreground">
              Your browser says you&rsquo;re in <strong>{browserZone}</strong>.{' '}
              <button
                type="button"
                className="underline hover:text-foreground disabled:opacity-50"
                onClick={() => updatePreferences({ timeZone: browserZone })}
                disabled={disabled}
              >
                Use it
              </button>
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Used to send the daily reminder at your local 8 PM and to compute
            &ldquo;today&rdquo; in your frame.
          </p>
        </div>

        {/* Daily reminder — opt-in. Off by default. */}
        <div className="flex items-center justify-between gap-6">
          <div className="space-y-0.5 max-w-md">
            <Label htmlFor="daily-reminder">Daily reminder / summary</Label>
            <p className="text-sm text-muted-foreground">
              Nightly 8 PM email summarizing what you&rsquo;ve logged today and
              highlighting anything missing — nutrition, fasting, exercise,
              daily goals, weight, journal.
            </p>
          </div>
          <Switch
            id="daily-reminder"
            checked={preferences.dailyReminder}
            onCheckedChange={(checked) => updatePreferences({ dailyReminder: checked })}
            disabled={disabled}
          />
        </div>

        <div className="flex items-center justify-between gap-6">
          <div className="space-y-0.5 max-w-md">
            <Label htmlFor="weekly-summary">Weekly summary emails</Label>
            <p className="text-sm text-muted-foreground">
              A weekly recap with AI coach insights.
            </p>
          </div>
          <Switch
            id="weekly-summary"
            checked={preferences.weeklyEmails}
            onCheckedChange={(checked) => updatePreferences({ weeklyEmails: checked })}
            disabled={disabled}
          />
        </div>

        <div className="flex items-center justify-between gap-6">
          <div className="space-y-0.5 max-w-md">
            <Label htmlFor="system-notifications">System notifications</Label>
            <p className="text-sm text-muted-foreground">
              Profile-completion nudges, inactivity reminders, and milestone prompts.
            </p>
          </div>
          <Switch
            id="system-notifications"
            checked={preferences.systemEmails}
            onCheckedChange={(checked) => updatePreferences({ systemEmails: checked })}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
};

export default EmailPreferencesSection;
