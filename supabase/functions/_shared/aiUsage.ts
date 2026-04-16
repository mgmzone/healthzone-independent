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

// Claude Sonnet 4 pricing (USD per 1M tokens) — keep in sync with anthropic.com/pricing.
// Adjust when models change.
const PRICING: Record<string, { inUsdPerMil: number; outUsdPerMil: number }> = {
  'claude-sonnet-4-20250514': { inUsdPerMil: 3.0, outUsdPerMil: 15.0 },
  'claude-opus-4-6':          { inUsdPerMil: 15.0, outUsdPerMil: 75.0 },
  'claude-haiku-4-5-20251001':{ inUsdPerMil: 1.0, outUsdPerMil: 5.0 },
};

export function estimateCostUsd(model: string | null | undefined, inTokens: number, outTokens: number): number {
  if (!model) return 0;
  const p = PRICING[model];
  if (!p) return 0;
  return (inTokens / 1_000_000) * p.inUsdPerMil + (outTokens / 1_000_000) * p.outUsdPerMil;
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
