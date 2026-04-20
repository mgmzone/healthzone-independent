import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { getJournalInsights, JournalInsights } from '@/lib/services/aiService';

// AI-generated pattern insights across the user's recent journal + tracking
// data. Cached in sessionStorage per user so refreshing the page doesn't
// re-spend tokens; an explicit Refresh button busts the cache.

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 min
const cacheKey = (userId: string) => `healthzone-journal-insights-${userId}`;

interface CachedEntry {
  data: JournalInsights;
  cachedAt: number;
}

function readCache(userId: string): CachedEntry | null {
  try {
    const raw = sessionStorage.getItem(cacheKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedEntry;
    if (Date.now() - parsed.cachedAt > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(userId: string, data: JournalInsights) {
  try {
    sessionStorage.setItem(cacheKey(userId), JSON.stringify({ data, cachedAt: Date.now() }));
  } catch {
    /* noop */
  }
}

const JournalInsightsCard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<JournalInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async (bustCache: boolean) => {
    if (!user?.id) return;
    if (!bustCache) {
      const cached = readCache(user.id);
      if (cached) {
        setData(cached.data);
        return;
      }
    }
    setLoading(true);
    setError(null);
    try {
      const result = await getJournalInsights();
      setData(result);
      writeCache(user.id, result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return (
    <Card className="mb-6 border-primary/30 bg-primary/5">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Patterns in your recent entries</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchInsights(true)}
            disabled={loading}
            aria-label="Refresh insights"
            className="shrink-0"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>

        {loading && !data && (
          <p className="text-sm text-muted-foreground">
            Scanning your last 14 days…
          </p>
        )}

        {error && !loading && (
          <p className="text-sm text-amber-700 dark:text-amber-400">{error}</p>
        )}

        {data && !loading && data.insights.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {data.reason || 'No notable patterns yet.'}
          </p>
        )}

        {data && data.insights.length > 0 && (
          <ul className="space-y-2">
            {data.insights.map((insight, i) => (
              <li key={i} className="text-sm leading-relaxed flex gap-2">
                <span className="text-primary font-semibold mt-0.5">·</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        )}

        {data && (
          <p className="text-xs text-muted-foreground mt-3">
            Based on {data.entryCount} entries through {data.asOfDate}. AI-generated &mdash; treat as starting points, not conclusions.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default JournalInsightsCard;
