// Shared CORS helper for edge functions. Fails closed: if ALLOWED_ORIGIN is
// not configured, no Access-Control-Allow-Origin header is sent, so browsers
// block cross-origin calls by default. Set ALLOWED_ORIGIN to a comma-separated
// list of trusted origins (including localhost URLs for local dev) before
// hitting these functions from a browser.

export function buildCorsHeaders(req: Request): Record<string, string> {
  const raw = Deno.env.get("ALLOWED_ORIGIN") || "";
  const allowed = raw.split(",").map((s) => s.trim()).filter(Boolean);
  const reqOrigin = req.headers.get("Origin") || "";

  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };

  if (allowed.length > 0 && allowed.includes(reqOrigin)) {
    headers["Access-Control-Allow-Origin"] = reqOrigin;
  }
  return headers;
}
