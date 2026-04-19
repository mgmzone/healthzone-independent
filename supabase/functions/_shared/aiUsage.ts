// Shared helper for recording Claude API usage. Every edge function that calls
// Claude should call logAiUsage with the response so we can size costs across
// users and detect freeloaders on the server-side fallback key.

export interface LogAiUsageInput {
  userId: string;
  functionName: string;
  model?: string | null;
  usage?: { input_tokens?: number; output_tokens?: number } | null;
  usedFallbackKey: boolean;
  status?: 'success' | 'error';
  error?: string | null;
}

// Claude pricing (USD per 1M tokens) — keep in sync with anthropic.com/pricing.
// Adjust when models change. Keys match both version aliases and dated snapshots
// so the actual model string returned by the API resolves correctly.
const PRICING: Record<string, { inUsdPerMil: number; outUsdPerMil: number }> = {
  'claude-sonnet-4-20250514':  { inUsdPerMil: 3.0, outUsdPerMil: 15.0 },
  'claude-sonnet-4-6':         { inUsdPerMil: 3.0, outUsdPerMil: 15.0 },
  'claude-opus-4-6':           { inUsdPerMil: 15.0, outUsdPerMil: 75.0 },
  'claude-opus-4-7':           { inUsdPerMil: 15.0, outUsdPerMil: 75.0 },
  'claude-haiku-4-5':          { inUsdPerMil: 1.0, outUsdPerMil: 5.0 },
  'claude-haiku-4-5-20251001': { inUsdPerMil: 1.0, outUsdPerMil: 5.0 },
};

export function estimateCostUsd(model: string | null | undefined, inTokens: number, outTokens: number): number {
  if (!model) return 0;
  // Try exact match first, then strip trailing dated snapshot suffix (e.g. -20250929).
  const exact = PRICING[model];
  if (exact) return (inTokens / 1_000_000) * exact.inUsdPerMil + (outTokens / 1_000_000) * exact.outUsdPerMil;
  const aliased = model.replace(/-\d{8}$/, '');
  const p = PRICING[aliased];
  if (!p) return 0;
  return (inTokens / 1_000_000) * p.inUsdPerMil + (outTokens / 1_000_000) * p.outUsdPerMil;
}

// Per-user daily spending cap on the shared server-side Claude API key.
// When a user doesn't have their own key and the fallback is used, they're
// effectively spending Mark's money — cap the damage. Configurable via the
// CLAUDE_FALLBACK_DAILY_CAP_USD env var; default is $0.25/day which covers a
// comfortable number of meal evals + dashboard summaries at Sonnet pricing.
const DEFAULT_DAILY_CAP_USD = 0.25;

export interface FallbackCapResult {
  capped: boolean;
  spentUsd: number;
  capUsd: number;
}

export async function checkFallbackDailyCap(
  supabase: any,
  userId: string
): Promise<FallbackCapResult> {
  const capUsd = Number(Deno.env.get('CLAUDE_FALLBACK_DAILY_CAP_USD') || DEFAULT_DAILY_CAP_USD);
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('ai_usage_logs')
    .select('cost_usd')
    .eq('user_id', userId)
    .eq('used_fallback_key', true)
    .gte('created_at', since);

  if (error) {
    console.error('Failed to check fallback cap:', error);
    // Fail open on infra errors — don't brick legitimate users when the
    // logging table is temporarily unreadable. The usage still gets logged on
    // the way out so a later check will catch them.
    return { capped: false, spentUsd: 0, capUsd };
  }

  const spentUsd = (data || []).reduce((sum: number, row: any) => sum + Number(row.cost_usd || 0), 0);
  return { capped: spentUsd >= capUsd, spentUsd, capUsd };
}

export async function logAiUsage(supabase: any, input: LogAiUsageInput): Promise<void> {
  const inputTokens = input.usage?.input_tokens ?? null;
  const outputTokens = input.usage?.output_tokens ?? null;
  const costUsd = inputTokens != null && outputTokens != null
    ? estimateCostUsd(input.model, inputTokens, outputTokens)
    : null;

  const { error } = await supabase.from('ai_usage_logs').insert({
    user_id: input.userId,
    function_name: input.functionName,
    model: input.model ?? null,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cost_usd: costUsd,
    used_fallback_key: input.usedFallbackKey,
    status: input.status ?? 'success',
    error: input.error ?? null,
  });

  if (error) {
    console.error('Failed to log AI usage:', error);
  }
}
