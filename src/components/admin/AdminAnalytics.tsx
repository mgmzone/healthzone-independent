import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useAdminAnalytics, AiUsageDayRow } from '@/hooks/admin/useAdminAnalytics';
import { format } from 'date-fns';

const FUNCTION_COLORS: Record<string, string> = {
  'evaluate-meal': '#10b981',
  'analyze-exercise': '#f59e0b',
  'ai-dashboard-feedback': '#6366f1',
  'send-weekly-summary': '#ec4899',
};

// Pivot AI usage rows ({day, function_name, calls}) into one row per day with
// one column per function_name — Recharts stacked chart expects this shape.
function pivotAiCalls(rows: AiUsageDayRow[]): { data: any[]; functions: string[] } {
  const byDay = new Map<string, Record<string, any>>();
  const functions = new Set<string>();
  for (const r of rows) {
    functions.add(r.function_name);
    const entry = byDay.get(r.day) || { day: r.day };
    entry[r.function_name] = r.calls;
    byDay.set(r.day, entry);
  }
  return {
    data: Array.from(byDay.values()).sort((a, b) => a.day.localeCompare(b.day)),
    functions: Array.from(functions),
  };
}

function pivotFallbackCost(rows: AiUsageDayRow[]) {
  const byDay = new Map<string, number>();
  for (const r of rows) {
    byDay.set(r.day, (byDay.get(r.day) || 0) + r.fallback_cost_usd);
  }
  return Array.from(byDay.entries())
    .map(([day, cost]) => ({ day, cost_usd: Number(cost.toFixed(4)) }))
    .sort((a, b) => a.day.localeCompare(b.day));
}

const fmtDay = (d: string) => {
  try {
    return format(new Date(d + 'T12:00:00'), 'MMM d');
  } catch {
    return d;
  }
};

const AdminAnalytics: React.FC = () => {
  const { signups, aiUsage, adoption, activity, isLoading, error } = useAdminAnalytics();

  const aiCallsPivoted = useMemo(() => pivotAiCalls(aiUsage), [aiUsage]);
  const fallbackCostSeries = useMemo(() => pivotFallbackCost(aiUsage), [aiUsage]);
  const total30dFallbackCost = useMemo(
    () => fallbackCostSeries.reduce((sum, r) => sum + r.cost_usd, 0),
    [fallbackCostSeries]
  );

  const adoptionRows = adoption ? [
    { label: 'Profile complete', count: adoption.profile_complete },
    { label: 'Active period', count: adoption.has_active_period },
    { label: 'Own Claude key', count: adoption.has_own_claude_key },
    { label: 'Strava connected', count: adoption.has_strava_connected },
    { label: 'Custom protein target', count: adoption.has_custom_protein_target },
    { label: 'Custom AI context', count: adoption.has_ai_context },
    { label: 'Logs macros', count: adoption.has_macro_data },
  ].map((r) => ({
    ...r,
    pct: adoption.total_users > 0 ? Math.round((r.count / adoption.total_users) * 100) : 0,
  })) : [];

  const wauDelta = adoption ? adoption.wau_this - adoption.wau_prior : 0;
  const wauTrendIcon = wauDelta > 0 ? TrendingUp : wauDelta < 0 ? TrendingDown : Minus;
  const wauTrendClass = wauDelta > 0 ? 'text-emerald-500' : wauDelta < 0 ? 'text-red-500' : 'text-muted-foreground';

  if (error) {
    return <Card><CardContent className="pt-6 text-destructive">Failed to load analytics: {(error as Error).message}</CardContent></Card>;
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse"><CardContent className="h-64" /></Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top-row snapshot numbers */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total Users</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{adoption?.total_users ?? 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Weekly Active (this week)</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold">{adoption?.wau_this ?? 0}</div>
              {adoption && (
                <div className={`flex items-center text-xs ${wauTrendClass}`}>
                  {React.createElement(wauTrendIcon, { className: 'h-3 w-3 mr-0.5' })}
                  {wauDelta > 0 ? '+' : ''}{wauDelta} vs prior
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">AI Calls (30d)</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {aiUsage.reduce((sum, r) => sum + r.calls, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">AI Cost On Us (30d)</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">${total30dFallbackCost.toFixed(4)}</div>
            <p className="text-xs text-muted-foreground mt-1">Fallback-key spending</p>
          </CardContent>
        </Card>
      </div>

      {/* Signups */}
      <Card>
        <CardHeader><CardTitle>Signups (last 30 days)</CardTitle></CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={signups}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tickFormatter={fmtDay} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip labelFormatter={fmtDay} />
                <Area type="monotone" dataKey="signups" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* AI calls by function — stacked */}
        <Card>
          <CardHeader><CardTitle>AI Calls by Function (30d)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={aiCallsPivoted.data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tickFormatter={fmtDay} tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip labelFormatter={fmtDay} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {aiCallsPivoted.functions.map((fn) => (
                    <Bar key={fn} dataKey={fn} stackId="ai" fill={FUNCTION_COLORS[fn] || '#94a3b8'} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Fallback cost per day */}
        <Card>
          <CardHeader><CardTitle>On-Us Cost per Day (30d, USD)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={fallbackCostSeries}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tickFormatter={fmtDay} tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip labelFormatter={fmtDay} formatter={(v: any) => [`$${Number(v).toFixed(4)}`, 'Cost']} />
                  <Line type="monotone" dataKey="cost_usd" stroke="#dc2626" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Activity volume */}
        <Card>
          <CardHeader><CardTitle>Activity Volume (14d)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activity}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tickFormatter={fmtDay} tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip labelFormatter={fmtDay} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="meals" stackId="a" fill="#10b981" />
                  <Bar dataKey="weigh_ins" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="exercises" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="fasting" stackId="a" fill="#a855f7" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Feature adoption */}
        <Card>
          <CardHeader><CardTitle>Feature Adoption (% of users)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={adoptionRows} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} width={140} />
                  <Tooltip formatter={(v: any, _n, props) => [`${v}% (${props.payload.count} users)`, '']} />
                  <Bar dataKey="pct" fill="#6366f1" radius={[0, 4, 4, 0]}>
                    {adoptionRows.map((_, i) => (
                      <Cell key={i} fill="#6366f1" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
