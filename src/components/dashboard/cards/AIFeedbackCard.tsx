import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, RefreshCw, Loader2, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react';
import { getDashboardFeedback, DashboardFeedback } from '@/lib/services/aiService';
import { useNavigate } from 'react-router-dom';

interface AIFeedbackCardProps {
  hasApiKey: boolean;
}

const CACHE_KEY = 'healthzone_ai_feedback';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function getCachedFeedback(): DashboardFeedback | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (Date.now() - cached.timestamp > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return cached.data;
  } catch {
    return null;
  }
}

function setCachedFeedback(data: DashboardFeedback) {
  sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
}

const AIFeedbackCard: React.FC<AIFeedbackCardProps> = ({ hasApiKey }) => {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<DashboardFeedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchFeedback = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getDashboardFeedback();
      setFeedback(result);
      setCachedFeedback(result);
    } catch (err: any) {
      setError(err.message || 'Failed to get AI feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasApiKey) return;
    const cached = getCachedFeedback();
    if (cached) {
      setFeedback(cached);
    } else {
      fetchFeedback();
    }
  }, [hasApiKey]);

  if (!hasApiKey) {
    return (
      <Card className="border-t-4" style={{ borderTopColor: '#8b5cf6' }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Brain className="h-4 w-4" style={{ color: '#8b5cf6' }} />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Get AI-powered weekly feedback on your progress.
          </p>
          <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
            Configure API Key
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-t-4" style={{ borderTopColor: '#8b5cf6' }}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Brain className="h-4 w-4" style={{ color: '#8b5cf6' }} />
            AI Insights
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={fetchFeedback}
            disabled={loading}
            title="Refresh AI feedback"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading && !feedback && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing your week...
          </div>
        )}

        {error && !feedback && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {feedback && (
          <>
            <p className="text-sm">{feedback.summary}</p>

            {feedback.highlights.length > 0 && (
              <div className="space-y-1">
                {feedback.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-sm">
                    <CheckCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-green-500" />
                    <span className="text-muted-foreground">{h}</span>
                  </div>
                ))}
              </div>
            )}

            {feedback.concerns.length > 0 && (
              <div className="space-y-1">
                {feedback.concerns.map((c, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-sm">
                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-500" />
                    <span className="text-muted-foreground">{c}</span>
                  </div>
                ))}
              </div>
            )}

            {feedback.tip && (
              <div className="flex items-start gap-1.5 text-sm rounded-md bg-muted/50 p-2">
                <Lightbulb className="h-3.5 w-3.5 mt-0.5 shrink-0 text-yellow-500" />
                <span>{feedback.tip}</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AIFeedbackCard;
