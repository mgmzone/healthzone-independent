import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2, Activity } from 'lucide-react';
import { getStravaStatus, saveStravaCredentials, syncStrava } from '@/lib/services/stravaService';
import { useToast } from '@/hooks/use-toast';

const IntegrationsTab: React.FC = () => {
  const { toast } = useToast();
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [connected, setConnected] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);

  const refreshStatus = async () => {
    const status = await getStravaStatus();
    setConnected(status.connected);
    setLastSyncAt(status.lastSyncAt);
  };

  useEffect(() => { refreshStatus(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveStravaCredentials({ clientId, clientSecret, refreshToken });
      toast({ title: 'Strava credentials saved' });
      setClientSecret('');
      setRefreshToken('');
      await refreshStatus();
    } catch (err: any) {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleBackfill = async () => {
    setSyncing(true);
    try {
      const res = await syncStrava('backfill');
      toast({ title: 'Backfill complete', description: `Imported ${res.inserted}, skipped ${res.skipped} of ${res.total}` });
      await refreshStatus();
    } catch (err: any) {
      toast({ title: 'Sync failed', description: err.message, variant: 'destructive' });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 text-orange-500" />
          Strava
        </h3>
        <p className="text-sm text-muted-foreground">
          Import your Strava activities as exercise logs. Each user supplies their own Strava API app credentials.
        </p>
      </div>

      <div className="rounded-md border bg-muted/30 p-4 space-y-2 text-sm">
        <p className="font-medium">One-time setup</p>
        <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
          <li>
            At{' '}
            <a href="https://www.strava.com/settings/api" target="_blank" rel="noopener noreferrer" className="underline">
              strava.com/settings/api
            </a>{' '}
            create (or edit) your API app. Strava's branding rules forbid "Strava" being a prominent part of your app name — use something like "MGM Fitness Sync". Set Authorization Callback Domain to a domain you control (e.g. <code className="bg-muted px-1 rounded">mgm.zone</code>).
          </li>
          <li>
            Visit this URL in your browser (replace <code>YOUR_CLIENT_ID</code> and use any <code>redirect_uri</code> that matches your callback domain — the destination doesn't need to serve anything, we just read the <code>code</code> from the URL bar):
            <br />
            <code className="break-all text-xs">
              https://www.strava.com/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=https://healthzone.mgm.zone&response_type=code&scope=activity:read_all&approval_prompt=force
            </code>
          </li>
          <li>After approving, Strava redirects to a URL ending in <code>?state=&amp;code=XXX&amp;scope=...</code>. Copy the <code>code=...</code> value.</li>
          <li>
            Exchange the code for a refresh token (replace placeholders):
            <br />
            <code className="break-all text-xs">
              curl -X POST https://www.strava.com/oauth/token -d client_id=YOUR_ID -d client_secret=YOUR_SECRET -d code=THE_CODE -d grant_type=authorization_code
            </code>
          </li>
          <li>Paste Client ID, Client Secret, and the returned <code>refresh_token</code> below. The refresh token is long-lived — access tokens are fetched on demand.</li>
        </ol>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="stravaClientId">Client ID</Label>
          <Input
            id="stravaClientId"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="e.g. 7421"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stravaClientSecret">Client Secret</Label>
          <div className="flex gap-2">
            <Input
              id="stravaClientSecret"
              type={showSecret ? 'text' : 'password'}
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              placeholder={connected ? '•••••••• (leave blank to keep existing)' : 'Client secret'}
              className="font-mono"
            />
            <Button type="button" variant="outline" size="icon" onClick={() => setShowSecret(s => !s)}>
              {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="stravaRefreshToken">Refresh Token</Label>
          <div className="flex gap-2">
            <Input
              id="stravaRefreshToken"
              type={showToken ? 'text' : 'password'}
              value={refreshToken}
              onChange={(e) => setRefreshToken(e.target.value)}
              placeholder={connected ? '•••••••• (leave blank to keep existing)' : 'refresh_token from step 5'}
              className="font-mono"
            />
            <Button type="button" variant="outline" size="icon" onClick={() => setShowToken(s => !s)}>
              {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="button" onClick={handleSave} disabled={saving || !clientId}>
          {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save credentials'}
        </Button>
        <Button type="button" variant="outline" onClick={handleBackfill} disabled={!connected || syncing}>
          {syncing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Syncing...</> : 'Backfill last 30 days'}
        </Button>
      </div>

      <div className="text-xs text-muted-foreground">
        Status: {connected ? <span className="text-green-600 font-medium">Connected</span> : 'Not connected'}
        {lastSyncAt && <> · Last sync {new Date(lastSyncAt).toLocaleString()}</>}
      </div>
    </div>
  );
};

export default IntegrationsTab;
