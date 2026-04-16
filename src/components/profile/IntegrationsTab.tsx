import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2, Activity, Link2 } from 'lucide-react';
import {
  getStravaStatus,
  saveStravaCredentials,
  syncStrava,
  exchangeStravaCode,
} from '@/lib/services/stravaService';
import { useToast } from '@/hooks/use-toast';

const STRAVA_REDIRECT_URI = `${window.location.origin}/profile`;
const STRAVA_STATE_KEY = 'healthzone.stravaOAuthState';

// Cryptographically-random state for CSRF protection on the Strava OAuth flow.
function generateOAuthState(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

const IntegrationsTab: React.FC = () => {
  const { toast } = useToast();
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [exchanging, setExchanging] = useState(false);
  const [connected, setConnected] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [storedClientId, setStoredClientId] = useState<string>('');

  const refreshStatus = async () => {
    const status = await getStravaStatus();
    setConnected(status.connected);
    setHasCredentials(status.hasCredentials);
    setLastSyncAt(status.lastSyncAt);
  };

  // Load stored client_id separately so we can use it when building the OAuth URL
  const loadStoredClientId = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase
        .from('profiles')
        .select('strava_client_id')
        .eq('id', session.user.id)
        .single();
      setStoredClientId(data?.strava_client_id || '');
    } catch {
      // ignore — purely for prefill
    }
  };

  useEffect(() => {
    refreshStatus();
    loadStoredClientId();
  }, []);

  // Handle OAuth callback: if URL has ?code=... from Strava, exchange it.
  // The `state` param must match what we stored in sessionStorage before the
  // redirect — prevents an attacker from binding their Strava account to the
  // user's session via a crafted link.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const scope = params.get('scope');
    const returnedState = params.get('state');
    const error = params.get('error');

    if (error) {
      toast({ title: 'Strava authorization failed', description: error, variant: 'destructive' });
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    if (code && scope) {
      const expectedState = sessionStorage.getItem(STRAVA_STATE_KEY);
      sessionStorage.removeItem(STRAVA_STATE_KEY);

      if (!expectedState || !returnedState || expectedState !== returnedState) {
        toast({
          title: 'Strava connection blocked',
          description: 'Authorization state mismatch. Please click Connect Strava again.',
          variant: 'destructive',
        });
        window.history.replaceState({}, '', window.location.pathname);
        return;
      }

      setExchanging(true);
      exchangeStravaCode(code)
        .then(() => {
          toast({ title: 'Strava connected', description: 'Refresh token saved.' });
          window.history.replaceState({}, '', window.location.pathname);
          return refreshStatus();
        })
        .catch((err: any) => {
          toast({ title: 'Strava connection failed', description: err.message, variant: 'destructive' });
          window.history.replaceState({}, '', window.location.pathname);
        })
        .finally(() => setExchanging(false));
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveStravaCredentials({ clientId, clientSecret, refreshToken: '' });
      toast({ title: 'Strava credentials saved' });
      setClientSecret('');
      await refreshStatus();
      await loadStoredClientId();
    } catch (err: any) {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleConnect = () => {
    const id = clientId || storedClientId;
    if (!id) {
      toast({ title: 'Save Client ID first', variant: 'destructive' });
      return;
    }
    const state = generateOAuthState();
    sessionStorage.setItem(STRAVA_STATE_KEY, state);
    const url = new URL('https://www.strava.com/oauth/authorize');
    url.searchParams.set('client_id', id);
    url.searchParams.set('redirect_uri', STRAVA_REDIRECT_URI);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'activity:read_all');
    url.searchParams.set('approval_prompt', 'force');
    url.searchParams.set('state', state);
    window.location.href = url.toString();
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
        <p className="font-medium">Setup</p>
        <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
          <li>
            At{' '}
            <a href="https://www.strava.com/settings/api" target="_blank" rel="noopener noreferrer" className="underline">
              strava.com/settings/api
            </a>{' '}
            create (or edit) your API app. Strava's branding rules forbid "Strava" being a prominent part of your app name. Set <strong>Authorization Callback Domain</strong> to the host part of <code className="bg-muted px-1 rounded">{window.location.host}</code>.
          </li>
          <li>Copy your Client ID and Client Secret, paste below, and click <strong>Save credentials</strong>.</li>
          <li>Click <strong>Connect Strava</strong>. You'll be redirected to Strava, approve access, and Strava will send you back here. Refresh token is stored automatically.</li>
          <li>Use <strong>Backfill last 30 days</strong> to pull recent activities, or the Sync button on the Exercise page for daily syncs.</li>
        </ol>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="stravaClientId">Client ID</Label>
          <Input
            id="stravaClientId"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder={storedClientId ? `${storedClientId} (leave blank to keep)` : 'e.g. 7421'}
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
              placeholder={hasCredentials ? '•••••••• (leave blank to keep existing)' : 'Client secret'}
              className="font-mono"
            />
            <Button type="button" variant="outline" size="icon" onClick={() => setShowSecret(s => !s)}>
              {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Button type="button" onClick={handleSave} disabled={saving || (!clientId && !clientSecret)}>
          {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save credentials'}
        </Button>
        <Button
          type="button"
          variant="default"
          onClick={handleConnect}
          disabled={exchanging || (!hasCredentials && !clientId)}
        >
          {exchanging
            ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting...</>
            : <><Link2 className="mr-2 h-4 w-4" /> {connected ? 'Reconnect Strava' : 'Connect Strava'}</>}
        </Button>
        <Button type="button" variant="outline" onClick={handleBackfill} disabled={!connected || syncing}>
          {syncing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Syncing...</> : 'Backfill last 30 days'}
        </Button>
      </div>

      <div className="text-xs text-muted-foreground">
        Status: {connected
          ? <span className="text-green-600 font-medium">Connected</span>
          : hasCredentials
            ? <span className="text-amber-600 font-medium">Credentials saved — click Connect to authorize</span>
            : 'Not connected'}
        {lastSyncAt && <> · Last sync {new Date(lastSyncAt).toLocaleString()}</>}
      </div>
    </div>
  );
};

export default IntegrationsTab;
