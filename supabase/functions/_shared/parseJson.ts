/**
 * Extract a JSON object from Claude's response.
 *
 * Sonnet, especially when the prompt asks for reasoning or self-checks,
 * often wraps the JSON in prose, code fences, or both. A naive regex that
 * only strips ```json fences throws on responses like:
 *
 *   "Let me think about this... {...} Assuming the user meant cooked..."
 *
 * and the caller silently gets `null`, which in evaluate-meal showed up as
 * all-zero macros with no error.
 *
 * This helper grabs the outermost `{...}` block from the text and parses it.
 * Returns `null` (never throws) so callers can fall back gracefully.
 */
export function extractJson<T = unknown>(responseText: string): T | null {
  if (!responseText) return null;
  const start = responseText.indexOf("{");
  const end = responseText.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return null;
  try {
    return JSON.parse(responseText.slice(start, end + 1)) as T;
  } catch (err) {
    console.error("extractJson: failed to parse candidate", {
      candidate: responseText.slice(start, end + 1).slice(0, 500),
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}
